import { ContactMessageSchema, fixPromptFor } from "@good-a11y/core/contracts";
import type { ScanView } from "@good-a11y/core/contracts";
import { Array, Number, Option, Schema } from "effect";
import { Update } from "foldkit";
import type { Runtime } from "foldkit";
import { UrlRequest } from "foldkit/navigation";
import { modifyFields } from "foldkit/struct";
import { toString as urlToString } from "foldkit/url";
import type { Url } from "foldkit/url";

import {
  CopyText,
  FocusFragment,
  FocusMainHeading,
  GetScan,
  LoadExternal,
  Navigate,
  SendMessage,
  StartScan,
} from "../client/commands.js";
import { Message } from "../client/message.js";
import type { AppMessage } from "../client/message.js";
import {
  ContactField,
  ContactState,
  CopyState,
  ScanState,
  StartState,
} from "../client/model.js";
import type { AppFlags, AppModel } from "../client/model.js";
import { pollTarget } from "../client/polling.js";
import type { ScanApi } from "../client/scan-api.js";
import {
  CONTACT_ALERT_ID,
  CONTACT_PROBLEMS_ID,
  CONTACT_SENT_ID,
} from "./landmarks.js";
import {
  AppRoute,
  isSameRoute,
  parseRoute,
  pathOf,
  reportSlugOf,
  scanRouter,
} from "./route.js";
import type { AppRouteState } from "./route.js";

type AppUpdate = Update.Return<AppModel, AppMessage, ScanApi>;

export const EMPTY_ADDRESS =
  "Type the address of a page, for example example.com.";

const isSettled = (view: ScanView): boolean =>
  view.stage === "published" || view.stage === "failed";

const scanStateOf = (view: ScanView) =>
  isSettled(view) ? ScanState.Settled({ view }) : ScanState.Running({ view });

const receiveScanView = (model: AppModel, view: ScanView): AppUpdate =>
  Schema.is(ScanState.Settled)(model.scan)
    ? { model }
    : { model: modifyFields(model, { scan: () => scanStateOf(view) }) };

const followedScan = (model: AppModel): Option.Option<string> => {
  if (Schema.is(AppRoute.Scan)(model.route)) {
    return Option.some(model.route.scanId);
  }

  return ScanState.isAnyOf(["Running", "Settled"])(model.scan)
    ? Option.some(model.scan.view.scanId)
    : Option.none();
};

const getScanOf = (model: AppModel, slug: string) =>
  GetScan({
    generation: model.generation,
    maybeScanId: followedScan(model),
    slug,
  });

const isValidContactField = {
  email: Schema.is(ContactMessageSchema.fields.email),
  message: Schema.is(ContactMessageSchema.fields.message),
};

const withContactState = (
  model: AppModel,
  state: typeof ContactState.Type
): AppModel =>
  modifyFields(model, {
    contact: (contact) => modifyFields(contact, { state: () => state }),
  });

const submitContact = (
  model: AppModel,
  maybeUrl: Option.Option<string>
): AppUpdate => {
  const { contact } = model;

  if (Schema.is(ContactState.Sending)(contact.state)) {
    return { model };
  }

  const typed = {
    email: contact.email.trim(),
    message: contact.message.trim(),
    name: contact.name.trim(),
  };

  const invalidFields = ContactField.literals.filter(
    (field) => !isValidContactField[field](typed[field])
  );

  return Array.match(invalidFields, {
    onEmpty: () => ({
      commands: [
        SendMessage({
          email: typed.email,
          maybeName:
            typed.name === "" ? Option.none() : Option.some(typed.name),
          maybeUrl,
          message: typed.message,
        }),
      ],
      model: withContactState(model, ContactState.Sending()),
    }),
    onNonEmpty: (fields) => ({
      commands: [FocusFragment({ id: CONTACT_PROBLEMS_ID })],
      model: withContactState(model, ContactState.Invalid({ fields })),
    }),
  });
};

const editContact = (
  model: AppModel,
  edit: (contact: AppModel["contact"]) => AppModel["contact"]
): AppUpdate => ({
  model: modifyFields(model, {
    contact: (contact) =>
      modifyFields(edit(contact), {
        state: (state) =>
          Schema.is(ContactState.Sending)(state)
            ? state
            : ContactState.Editing(),
      }),
  }),
});

const enterRoute = (
  model: AppModel,
  route: AppRouteState,
  maybeView: Option.Option<ScanView> = Option.none()
): AppUpdate => {
  const maybeSlug = reportSlugOf(route);

  const entered = modifyFields(model, {
    copy: () => CopyState.Idle(),
    generation: Number.increment,
    route: () => route,
    scan: () =>
      Option.isNone(maybeSlug)
        ? ScanState.Idle()
        : Option.match(maybeView, {
            onNone: () => ScanState.Loading(),
            onSome: scanStateOf,
          }),
    start: () => StartState.Idle(),
    url: (url) =>
      Schema.is(AppRoute.Check)(route) && route.url !== undefined
        ? route.url
        : url,
  });

  return Option.isSome(maybeSlug) && !Schema.is(ScanState.Settled)(entered.scan)
    ? { commands: [getScanOf(entered, maybeSlug.value)], model: entered }
    : { model: entered };
};

const focusOn =
  (focus: NonNullable<AppUpdate["commands"]>[number]) =>
  (model: AppModel): AppUpdate => ({ commands: [focus], model });

const changeUrl = (model: AppModel, url: Url): AppUpdate => {
  const route = parseRoute(url);

  return Option.match(url.hash, {
    onNone: () =>
      pathOf(route) === pathOf(model.route)
        ? enterRoute(model, route)
        : Update.combine(model, [
            (stepModel) => enterRoute(stepModel, route),
            focusOn(FocusMainHeading()),
          ]),
    onSome: (id) =>
      isSameRoute(route, model.route)
        ? focusOn(FocusFragment({ id }))(model)
        : Update.combine(model, [
            (stepModel) => enterRoute(stepModel, route),
            focusOn(FocusFragment({ id })),
          ]),
  });
};

const submitScan = (model: AppModel): AppUpdate => {
  const url = model.url.trim();

  if (Schema.is(StartState.Submitting)(model.start)) {
    return { model };
  }

  if (url === "") {
    return {
      model: modifyFields(model, {
        start: () => StartState.Refused({ message: EMPTY_ADDRESS }),
      }),
    };
  }

  return {
    commands: [StartScan({ generation: model.generation, url })],
    model: modifyFields(model, { start: () => StartState.Submitting() }),
  };
};

export const init: Runtime.RoutingApplicationInit<
  AppModel,
  AppMessage,
  AppFlags,
  ScanApi
> = (flags, url) =>
  enterRoute(
    {
      contact: {
        email: "",
        message: "",
        name: "",
        state: ContactState.Editing(),
      },
      copy: CopyState.Idle(),
      generation: 0,
      origin: flags.origin,
      route: AppRoute.Home(),
      scan: ScanState.Idle(),
      start: StartState.Idle(),
      url: "",
    },
    parseRoute(url),
    flags.maybeScan
  );

const copyFixPrompt = (model: AppModel, key: string): AppUpdate => {
  const maybeText = Schema.is(ScanState.Settled)(model.scan)
    ? Option.fromNullishOr(model.scan.view.report).pipe(
        Option.flatMap((report) =>
          Option.fromNullishOr(fixPromptFor(report, key))
        )
      )
    : Option.none();

  return Option.match(maybeText, {
    onNone: () => ({ model }),
    onSome: (text) => ({ commands: [CopyText({ key, text })], model }),
  });
};

export const update = (model: AppModel, message: AppMessage): AppUpdate =>
  Message.match<AppUpdate>(message, {
    ChangedUrl: ({ url }) => changeUrl(model, url),
    ClickedCopyFixPrompt: ({ key }) => copyFixPrompt(model, key),
    ClickedCopyText: ({ text }) => ({
      commands: [CopyText({ key: text, text })],
      model,
    }),
    ClickedLink: ({ request }) =>
      UrlRequest.match<AppUpdate>(request, {
        External: ({ href }) => ({ commands: [LoadExternal({ href })], model }),
        Internal: ({ url }) => ({
          commands: [Navigate({ url: urlToString(url) })],
          model,
        }),
      }),
    CompletedFocusFragment: () => ({ model }),
    CompletedFocusMainHeading: () => ({ model }),
    CompletedLoadExternal: () => ({ model }),
    CompletedNavigate: () => ({ model }),
    FailedCopyText: ({ key, text }) => ({
      model: modifyFields(model, {
        copy: () => CopyState.Failed({ key, text }),
      }),
    }),
    FailedGetScan: ({ generation, isUnknownScan }) =>
      generation === model.generation &&
      !Schema.is(ScanState.Settled)(model.scan)
        ? {
            model: modifyFields(model, {
              scan: () =>
                isUnknownScan ? ScanState.Unknown() : ScanState.Unavailable(),
            }),
          }
        : { model },
    FailedSendMessage: ({ maybeMessage }) => ({
      commands: [FocusFragment({ id: CONTACT_ALERT_ID })],
      model: withContactState(
        model,
        Option.match(maybeMessage, {
          onNone: () => ContactState.Unavailable(),
          onSome: (refusal) => ContactState.Refused({ message: refusal }),
        })
      ),
    }),
    FailedStartScan: ({ generation, maybeMessage }) =>
      generation === model.generation
        ? {
            model: modifyFields(model, {
              start: () =>
                Option.match(maybeMessage, {
                  onNone: () => StartState.Unavailable(),
                  onSome: (refusal) => StartState.Refused({ message: refusal }),
                }),
            }),
          }
        : { model },
    SubmittedContactForm: ({ maybeUrl }) => submitContact(model, maybeUrl),
    SubmittedScanForm: () => submitScan(model),
    SucceededCopyText: ({ key }) => ({
      model: modifyFields(model, { copy: () => CopyState.Copied({ key }) }),
    }),
    SucceededGetScan: ({ generation, view }) =>
      generation === model.generation
        ? receiveScanView(model, view)
        : { model },
    SucceededSendMessage: () => ({
      commands: [FocusFragment({ id: CONTACT_SENT_ID })],
      model: modifyFields(model, {
        contact: (contact) =>
          modifyFields(contact, {
            message: () => "",
            state: () => ContactState.Sent(),
          }),
      }),
    }),
    SucceededStartScan: ({ generation, scanId, slug }) =>
      generation === model.generation
        ? {
            commands: [Navigate({ url: scanRouter({ scanId, slug }) })],
            model,
          }
        : { model },
    TickedPoll: () =>
      Option.match(pollTarget(model), {
        onNone: () => ({ model }),
        onSome: (slug) => ({ commands: [getScanOf(model, slug)], model }),
      }),
    UpdatedContactEmail: ({ value }) =>
      editContact(model, (contact) =>
        modifyFields(contact, { email: () => value })
      ),
    UpdatedContactMessage: ({ value }) =>
      editContact(model, (contact) =>
        modifyFields(contact, { message: () => value })
      ),
    UpdatedContactName: ({ value }) =>
      editContact(model, (contact) =>
        modifyFields(contact, { name: () => value })
      ),
    UpdatedScanUrl: ({ value }) => ({
      model: modifyFields(model, {
        start: (start) =>
          Schema.is(StartState.Submitting)(start) ? start : StartState.Idle(),
        url: () => value,
      }),
    }),
  });
