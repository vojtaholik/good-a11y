import { describe, it } from "@effect/vitest";
import { Option } from "effect";
import {
  Command,
  click,
  expect,
  given,
  label,
  role,
  scene,
  type,
} from "foldkit/scene";

import { StartScan } from "../src/client/commands.js";
import { Message } from "../src/client/message.js";
import { EMPTY_ADDRESS, update } from "../src/features/update.js";
import { view } from "../src/features/view.js";
import { modelAt } from "./fixtures.js";

const CHECK_BUTTON = role("button", { name: "Check the page" });

describe("the start page", () => {
  it("offers a skip link, the checker and the guides", () => {
    scene(
      { update, view },
      given(modelAt("/")),
      expect(role("link", { name: "Skip to content" })).toExist(),
      expect(
        role("heading", { name: "Accessibility guides for coding agents" })
      ).toExist(),
      expect(label("Page address")).toExist(),
      expect(role("link", { name: "Modal dialog" })).toExist()
    );
  });

  it("says what to type when the address is empty", () => {
    scene(
      { update, view },
      given(modelAt("/")),
      click(CHECK_BUTTON),
      expect(role("status")).toHaveText(EMPTY_ADDRESS)
    );
  });

  it("disables the button while the scan starts and reports a refusal", () => {
    scene(
      { update, view },
      given(modelAt("/check")),
      type(label("Page address"), "localhost"),
      click(CHECK_BUTTON),
      expect(CHECK_BUTTON).toBeDisabled(),
      Command.resolve(
        StartScan,
        Message.FailedStartScan({
          generation: 1,
          maybeMessage: Option.some("That address is not public."),
        })
      ),
      expect(CHECK_BUTTON).toBeEnabled(),
      expect(role("status")).toHaveText("That address is not public.")
    );
  });
});

describe("a report page", () => {
  it("names the site while the report loads", () => {
    scene(
      { update, view },
      given(modelAt("/check/example.com")),
      expect(role("heading", { name: "Report for example.com" })).toExist()
    );
  });
});
