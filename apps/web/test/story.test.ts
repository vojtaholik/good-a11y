import { describe, expect, it } from "@effect/vitest";
import { Option } from "effect";
import { Command, given, message, model, story } from "foldkit/story";

import {
  FocusFragment,
  FocusMainHeading,
  GetScan,
  Navigate,
  SendMessage,
  StartScan,
} from "../src/client/commands.js";
import { Message } from "../src/client/message.js";
import { ContactState, StartState } from "../src/client/model.js";
import { AppRoute } from "../src/features/route.js";
import { EMPTY_ADDRESS, update } from "../src/features/update.js";
import { modelAt, urlOf } from "./fixtures.js";

describe("starting a scan", () => {
  it("refuses an empty address without calling the scanner", () => {
    story(
      update,
      given(modelAt("/")),
      message(Message.SubmittedScanForm()),
      Command.expectNone(),
      model((submitted) => {
        expect(submitted.start).toEqual(
          StartState.Refused({ message: EMPTY_ADDRESS })
        );
      })
    );
  });

  it("opens the report of the started scan", () => {
    story(
      update,
      given(modelAt("/")),
      message(Message.UpdatedScanUrl({ value: " example.com " })),
      message(Message.SubmittedScanForm()),
      model((submitted) => {
        expect(submitted.start._tag).toBe("Submitting");
      }),
      Command.resolve(
        StartScan,
        Message.SucceededStartScan({
          generation: 1,
          scanId: "scan-1",
          slug: "example.com",
        })
      ),
      Command.expectExact(Navigate({ url: "/check/example.com/scan-1" })),
      Command.resolve(Navigate, Message.CompletedNavigate())
    );
  });

  it("shows the scanner's refusal and keeps the address", () => {
    story(
      update,
      given(modelAt("/")),
      message(Message.UpdatedScanUrl({ value: "localhost" })),
      message(Message.SubmittedScanForm()),
      Command.resolve(
        StartScan,
        Message.FailedStartScan({
          generation: 1,
          maybeMessage: Option.some("That address is not public."),
        })
      ),
      model((refused) => {
        expect(refused.start).toEqual(
          StartState.Refused({ message: "That address is not public." })
        );
        expect(refused.url).toBe("localhost");
      })
    );
  });
});

describe("reading a report", () => {
  it("asks for the scan of the report route and names an unknown scan", () => {
    story(
      update,
      given(modelAt("/")),
      message(Message.ChangedUrl({ url: urlOf("/check/example.com/scan-1") })),
      Command.expectHas(
        GetScan({
          generation: 2,
          maybeScanId: Option.some("scan-1"),
          slug: "example.com",
        })
      ),
      model((entered) => {
        expect(entered.scan._tag).toBe("Loading");
      }),
      Command.resolve(FocusMainHeading, Message.CompletedFocusMainHeading()),
      Command.resolve(
        GetScan,
        Message.FailedGetScan({ generation: 2, isUnknownScan: true })
      ),
      model((failed) => {
        expect(failed.scan._tag).toBe("Unknown");
      })
    );
  });

  it("ignores an answer for a page the visitor already left", () => {
    story(
      update,
      given(modelAt("/check/example.com/scan-1")),
      message(Message.FailedGetScan({ generation: 0, isUnknownScan: false })),
      model((stale) => {
        expect(stale.scan._tag).toBe("Loading");
      })
    );
  });
});

describe("moving between pages", () => {
  it("moves focus to the new page's heading", () => {
    story(
      update,
      given(modelAt("/")),
      message(Message.ChangedUrl({ url: urlOf("/guides/dialog-modal") })),
      Command.expectExact(FocusMainHeading()),
      Command.resolve(FocusMainHeading, Message.CompletedFocusMainHeading()),
      model((entered) => {
        expect(entered.route).toEqual(
          AppRoute.Guide({ guideId: "dialog-modal" })
        );
      })
    );
  });

  it("moves focus to the target of an in-page link and keeps the page", () => {
    const home = modelAt("/");

    story(
      update,
      given(home),
      message(Message.ChangedUrl({ url: urlOf("/#main") })),
      Command.expectExact(FocusFragment({ id: "main" })),
      Command.resolve(FocusFragment, Message.CompletedFocusFragment()),
      model((same) => {
        expect(same.generation).toBe(home.generation);
      })
    );
  });

  it("leaves focus alone when only the query changes", () => {
    story(
      update,
      given(modelAt("/check")),
      message(Message.ChangedUrl({ url: urlOf("/check?url=example.com") })),
      Command.expectNone(),
      model((entered) => {
        expect(entered.url).toBe("example.com");
      })
    );
  });
});

describe("the contact form", () => {
  it("marks the fields that need fixing and moves focus to the summary", () => {
    story(
      update,
      given(modelAt("/contact")),
      message(Message.SubmittedContactForm({ maybeUrl: Option.none() })),
      Command.resolve(
        FocusFragment({ id: "contact-problems" }),
        Message.CompletedFocusFragment()
      ),
      model((submitted) => {
        expect(submitted.contact.state).toEqual(
          ContactState.Invalid({ fields: ["email", "message"] })
        );
      })
    );
  });

  it("sends the message, clears it once it arrived, and focuses the confirmation", () => {
    story(
      update,
      given(modelAt("/contact")),
      message(Message.UpdatedContactEmail({ value: "a@example.com" })),
      message(Message.UpdatedContactMessage({ value: "Please help." })),
      message(Message.SubmittedContactForm({ maybeUrl: Option.none() })),
      Command.resolve(SendMessage, Message.SucceededSendMessage()),
      Command.resolve(
        FocusFragment({ id: "contact-sent" }),
        Message.CompletedFocusFragment()
      ),
      model((sent) => {
        expect(sent.contact.state._tag).toBe("Sent");
        expect(sent.contact.message).toBe("");
        expect(sent.contact.email).toBe("a@example.com");
      })
    );
  });

  it("keeps the text and focuses the alert when the server does not answer", () => {
    story(
      update,
      given(modelAt("/check/example.com")),
      message(Message.UpdatedContactEmail({ value: "a@example.com" })),
      message(Message.UpdatedContactMessage({ value: "Please help." })),
      message(
        Message.SubmittedContactForm({
          maybeUrl: Option.some("https://example.com/"),
        })
      ),
      Command.resolve(
        SendMessage({
          email: "a@example.com",
          maybeName: Option.none(),
          maybeUrl: Option.some("https://example.com/"),
          message: "Please help.",
        }),
        Message.FailedSendMessage({ maybeMessage: Option.none() })
      ),
      Command.resolve(
        FocusFragment({ id: "contact-alert" }),
        Message.CompletedFocusFragment()
      ),
      model((failed) => {
        expect(failed.contact.state._tag).toBe("Unavailable");
        expect(failed.contact.message).toBe("Please help.");
      })
    );
  });
});
