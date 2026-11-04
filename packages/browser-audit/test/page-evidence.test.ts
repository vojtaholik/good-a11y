import {
  EmptySubmitsSchema,
  ForeignBlocksSchema,
  FormInstructionsSchema,
  VisualHeadingsSchema,
} from "@eaa-check/core";
import { describe, expect, it } from "@effect/vitest";
import { Schema } from "effect";
import { Window } from "happy-dom";

import { evidenceSource } from "#page-scripts";

const pageWith = (html: string) => {
  const window = new Window({
    settings: {
      enableJavaScriptEvaluation: true,
      suppressInsecureJavaScriptEnvironmentWarning: true,
    },
  });

  window.Element.prototype.getBoundingClientRect = () =>
    new window.DOMRect(10, 10, 100, 30);
  window.document.write(html);
  window.eval(evidenceSource);

  return window;
};

const asText = Schema.decodeUnknownSync(Schema.String);

const run = (window: Window, expression: string): string =>
  asText(window.eval(`__eaaEvidence.${expression}`));

const Headings = Schema.decodeUnknownSync(
  Schema.fromJsonString(VisualHeadingsSchema)
);

const Instructions = Schema.decodeUnknownSync(
  Schema.fromJsonString(FormInstructionsSchema)
);

const Foreign = Schema.decodeUnknownSync(
  Schema.fromJsonString(ForeignBlocksSchema)
);

const Submits = Schema.decodeUnknownSync(EmptySubmitsSchema);

describe("rendered evidence read in the page", () => {
  it("finds text styled as a heading, but not text around a heading or right under one", () => {
    const window = pageWith(
      `<body style="font-size:16px"><h2 style="font-size:24px">Real heading</h2><p>Intro under the heading</p><div style="font-size:24px">Delivery and returns</div><div style="font-size:24px"><h1>Welcome</h1></div><div><h3>People</h3><p style="font-size:24px">Who we are</p></div><p style="font-size:16px">${"Body text that runs on for a while. ".repeat(5)}</p><a href="/x" style="font-size:24px;display:block">Big link</a><div style="font-size:16px;font-weight:700">Opening hours</div></body>`
    );

    const headings = Headings(run(window, "visualHeadings()"));

    expect(headings.bodyFontSize).toBe(16);
    expect(headings.headings).toBe(3);
    expect(headings.candidates.map(({ text }) => text)).toEqual([
      "Delivery and returns",
      "Opening hours",
    ]);
  });

  it("collects each field's label, description and nearby text", () => {
    const window = pageWith(
      '<form><div><label for="e">Email</label><div><input id="e" type="email" required aria-describedby="h"></div><p id="h">We never share it.</p></div><div><div><input name="code" placeholder="Code"></div><span>Six digits, from your letter</span></div></form>'
    );

    const { fields } = Instructions(run(window, "formInstructions()"));

    expect(
      fields.map(
        ({ describedBy, form, label, placeholder, required, type }) => ({
          describedBy,
          form,
          label,
          placeholder,
          required,
          type,
        })
      )
    ).toEqual([
      {
        describedBy: "We never share it.",
        form: 0,
        label: "Email",
        placeholder: "",
        required: true,
        type: "email",
      },
      {
        describedBy: "",
        form: 0,
        label: "",
        placeholder: "Code",
        required: false,
        type: "text",
      },
    ]);
    expect(fields[1]?.nearby).toContain("Six digits");
  });

  it("names blocks whose common words belong to another language than their lang", () => {
    const window = pageWith(
      '<html lang="en"><body><p>The shop is open and you are welcome to visit us with your family for the day.</p><p>Der Laden ist nicht geöffnet und die Kasse ist auch für die Woche geschlossen.</p><p lang="de">Die Lieferung ist kostenlos und auch schnell für alle Kunden mit einem Konto.</p></body></html>'
    );

    const foreign = Foreign(run(window, "foreignBlocks()"));

    expect(foreign.pageLang).toBe("en");
    expect(foreign.blocks.map(({ guess, lang }) => ({ guess, lang }))).toEqual([
      { guess: "de", lang: "en" },
    ]);
  });

  it("submits only forms without password or payment fields, and reads what appeared", () => {
    const window = pageWith(
      '<form id="news"><input name="email" type="email" required value="x@y.eu"><button>Join</button></form><form><input type="password" name="p"></form><form><input name="cc-number" autocomplete="cc-number"></form><form role="search"><input type="search" name="q"></form>'
    );

    const news = window.document.querySelector("#news");

    news?.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = window.document.createElement("p");

      message.setAttribute("role", "alert");
      message.textContent = "Enter your email address";
      news.append(message);
    });

    const forms = run(window, "listForms()");
    const submitted = run(window, "submitEmpty(0)");
    const errors = run(window, "readErrors(0)");

    const decoded = Submits({
      forms,
      submissions: [
        {
          blocked: [],
          blockedCount: 0,
          errors,
          index: 0,
          left: false,
          submitted,
        },
      ],
    });

    expect(
      decoded.forms.map(({ index, skipped }) => ({ index, skipped }))
    ).toEqual([
      { index: 0, skipped: null },
      { index: -1, skipped: "password" },
      { index: -1, skipped: "payment" },
      { index: -1, skipped: "search" },
    ]);
    expect(window.document.querySelector("input")?.getAttribute("value")).toBe(
      "x@y.eu"
    );

    const [submission] = decoded.submissions;

    expect(
      submission?.errors?.invalid.map(({ native }) => native === null)
    ).toEqual([false]);
  });
});
