import { ContactMessageSchema, fixPromptFor } from "@eaa-check/core/contracts";
import type { ScanView } from "@eaa-check/core/contracts";
import { Option, Schema } from "effect";
import type { Runtime, Update } from "foldkit";
import { UrlRequest } from "foldkit/navigation";
import { modifyFields } from "foldkit/struct";
import { toString as urlToString } from "foldkit/url";

import {
  CopyText,
  GetScan,
  LoadExternal,
  Navigate,
  SendMessage,
  StartScan,
} from "../client/commands.js";
import {
  ContactField,
  ContactState,
  CopyState,
  Message,
  ScanState,
  StartState,
} from "../client/model.js";
import type { AppMessage, AppModel } from "../client/model.js";
import { pollTarget } from "../client/polling.js";
import type { ScanApi } from "../client/scan-api.js";
import { AppRoute, parseRoute, reportSlugOf, scanRouter } from "./route.js";
import type { AppRouteState } from "./route.js";

type AppUpdate = Update.Return<AppModel, AppMessage, ScanApi>;

export const EMPTY_ADDRESS =
  "Type the address of a page, for example example.com.";

const isSettled = (view: ScanView): boolean =>
  view.stage === "published" || view.stage === "failed";

const readScan = (model: AppModel, view: ScanView): AppUpdate =>
  Schema.is(ScanState.Settled)(model.scan)
    ? { model }
    : {
        model: modifyFields(model, {
          scan: () =>
            isSettled(view)
              ? ScanState.Settled({ view })
              : ScanState.Running({ view }),
        }),
      };

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

const submitContact = (model: AppModel, url: string): AppUpdate => {
  const { contact } = model;

  if (Schema.is(ContactState.Sending)(contact.state)) {
    return { model };
  }

  const typed = {
    email: contact.email.trim(),
    message: contact.message.trim(),
    name: contact.name.trim(),
  };

  const fields = ContactField.literals.filter(
    (field) => !isValidContactField[field](typed[field])
  );

  if (fields.length > 0) {
    return {
      model: modifyFields(model, {
        contact: () => ({
          ...contact,
          state: ContactState.Invalid({ fields }),
        }),
      }),
    };
  }

  return {
    commands: [
      SendMessage({
        email: typed.email,
        maybeName: typed.name === "" ? Option.none() : Option.some(typed.name),
        message: typed.message,
        url,
      }),
    ],
    model: modifyFields(model, {
      contact: () => ({ ...contact, state: ContactState.Sending() }),
    }),
  };
};

const editContact = (
  model: AppModel,
  field: "email" | "message" | "name",
  value: string
): AppUpdate => ({
  model: modifyFields(model, {
    contact: (contact) => ({
      ...contact,
      [field]: value,
      state: Schema.is(ContactState.Sending)(contact.state)
        ? contact.state
        : ContactState.Editing(),
    }),
  }),
});

const enterRoute = (model: AppModel, route: AppRouteState): AppUpdate => {
  const generation = model.generation + 1;
  const maybeSlug = reportSlugOf(route);

  const entered: AppModel = {
    ...model,
    copy: CopyState.Idle(),
    generation,
    route,
    scan: Option.isSome(maybeSlug) ? ScanState.Loading() : ScanState.Idle(),
    start: StartState.Idle(),
    url:
      Schema.is(AppRoute.Home)(route) && route.url !== undefined
        ? route.url
        : model.url,
  };

  return Option.match(maybeSlug, {
    onNone: () => ({ model: entered }),
    onSome: (slug) => ({
      commands: [getScanOf(entered, slug)],
      model: entered,
    }),
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
  void,
  ScanApi
> = (url) =>
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
      route: AppRoute.Home({}),
      scan: ScanState.Idle(),
      start: StartState.Idle(),
      url: "",
    },
    parseRoute(url)
  );

const copyFixPrompt = (model: AppModel, key: string): AppUpdate => {
  const report = Schema.is(ScanState.Settled)(model.scan)
    ? model.scan.view.report
    : null;

  const text = report === null ? null : fixPromptFor(report, key);

  return text === null
    ? { model }
    : { commands: [CopyText({ key, text })], model };
};

export const update = (model: AppModel, message: AppMessage): AppUpdate =>
  Message.match<AppUpdate>(message, {
    ChangedUrl: ({ url }) => enterRoute(model, parseRoute(url)),
    ClickedCopyFixPrompt: ({ key }) => copyFixPrompt(model, key),
    ClickedLink: ({ request }) =>
      UrlRequest.match<AppUpdate>(request, {
        External: ({ href }) => ({ commands: [LoadExternal({ href })], model }),
        Internal: ({ url }) => ({
          commands: [Navigate({ url: urlToString(url) })],
          model,
        }),
      }),
    CompletedLoadExternal: () => ({ model }),
    CompletedNavigate: () => ({ model }),
    FailedCopyFixPrompt: ({ key, text }) => ({
      model: modifyFields(model, {
        copy: () => CopyState.Failed({ key, text }),
      }),
    }),
    FailedGetScan: ({ generation, unknown }) =>
      generation === model.generation &&
      !Schema.is(ScanState.Settled)(model.scan)
        ? {
            model: modifyFields(model, {
              scan: () =>
                unknown ? ScanState.Unknown() : ScanState.Unavailable(),
            }),
          }
        : { model },
    FailedSendMessage: ({ maybeMessage }) => ({
      model: modifyFields(model, {
        contact: (contact) => ({
          ...contact,
          state: Option.match(maybeMessage, {
            onNone: () => ContactState.Unavailable(),
            onSome: (refusal) => ContactState.Refused({ message: refusal }),
          }),
        }),
      }),
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
    SubmittedContactForm: ({ url }) => submitContact(model, url),
    SubmittedScanForm: () => submitScan(model),
    SucceededCopyFixPrompt: ({ key }) => ({
      model: modifyFields(model, { copy: () => CopyState.Copied({ key }) }),
    }),
    SucceededGetScan: ({ generation, view }) =>
      generation === model.generation ? readScan(model, view) : { model },
    SucceededSendMessage: () => ({
      model: modifyFields(model, {
        contact: (contact) => ({
          ...contact,
          message: "",
          state: ContactState.Sent(),
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
    UpdatedContactEmail: ({ value }) => editContact(model, "email", value),
    UpdatedContactMessage: ({ value }) => editContact(model, "message", value),
    UpdatedContactName: ({ value }) => editContact(model, "name", value),
    UpdatedScanUrl: ({ value }) => ({
      model: modifyFields(model, {
        start: (start) =>
          Schema.is(StartState.Submitting)(start) ? start : StartState.Idle(),
        url: () => value,
      }),
    }),
  });
