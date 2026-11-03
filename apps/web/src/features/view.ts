import type { Document, Html, HtmlBuilder } from "foldkit/html";

import { Message, StartState } from "../client/model.js";
import type { AppMessage, AppModel } from "../client/model.js";
import { reportView } from "./report-view.js";
import { AppRoute, homeRouter } from "./route.js";
import { styles } from "./styles.js";
import { sx } from "./sx.js";

const startStatus = (model: AppModel): string =>
  StartState.match<string>(model.start, {
    Idle: () => "",
    Refused: ({ message }) => message,
    Submitting: () => "Starting the scan…",
    Unavailable: () =>
      "The scan could not start because the server did not answer. Your address is still in the form; try again.",
  });

const isSubmitting = (model: AppModel): boolean =>
  StartState.matchOrElse<boolean>(
    model.start,
    { Submitting: () => true },
    () => false
  );

const homeView = (model: AppModel, h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [],
    [
      h.h1([], ["Find accessibility issues on one page"]),
      h.p(
        [],
        [
          "Paste the address of a web page. We fetch it once, run automated checks on its HTML, and show what they find, with the WCAG success criteria and EN 301 549 clauses each check relates to.",
        ]
      ),
      h.form(
        [h.OnSubmit(Message.SubmittedScanForm())],
        [
          h.label([h.For("scan-url")], ["Page address"]),
          h.input([
            h.Id("scan-url"),
            h.Name("url"),
            h.Autocomplete("url"),
            h.Placeholder("example.com"),
            h.Value(model.url),
            h.AriaDescribedBy("scan-status"),
            h.OnInput((value) => Message.UpdatedScanUrl({ value })),
            sx(h, styles.input),
          ]),
          h.button(
            [
              h.Type("submit"),
              h.Disabled(isSubmitting(model)),
              sx(h, styles.button),
            ],
            ["Check the page"]
          ),
        ]
      ),
      h.p([h.Id("scan-status"), h.Role("status")], [startStatus(model)]),
    ]
  );

const notFoundView = (h: HtmlBuilder<AppMessage>): Html =>
  h.main(
    [],
    [
      h.h1([], ["Page not found"]),
      h.p([], [h.a([h.Href(homeRouter())], ["Back to the start"])]),
    ]
  );

const titleOf = (model: AppModel): string =>
  AppRoute.match<string>(model.route, {
    Home: () => "eaa-check: automated EU accessibility checks",
    NotFound: () => "Page not found | eaa-check",
    Report: ({ slug }) => `Report for ${slug} | eaa-check`,
  });

export const view = (
  model: AppModel,
  h: HtmlBuilder<AppMessage>
): Document => ({
  body: h.div(
    [sx(h, styles.page)],
    [
      h.header([], [h.nav([], [h.a([h.Href(homeRouter())], ["eaa-check"])])]),
      AppRoute.match<Html>(model.route, {
        Home: () => homeView(model, h),
        NotFound: () => notFoundView(h),
        Report: ({ slug }) => reportView(model, slug, h),
      }),
    ]
  ),
  lang: "en",
  title: titleOf(model),
});
