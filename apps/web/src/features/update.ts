import type { ScanView } from "@eaa-check/core/contracts";
import { Option, Schema } from "effect";
import type { Runtime, Update } from "foldkit";
import { UrlRequest } from "foldkit/navigation";
import { modifyFields } from "foldkit/struct";
import { toString as urlToString } from "foldkit/url";

import {
  GetScan,
  LoadExternal,
  Navigate,
  StartScan,
} from "../client/commands.js";
import { Message, ScanState, StartState } from "../client/model.js";
import type { AppMessage, AppModel } from "../client/model.js";
import { pollTarget } from "../client/polling.js";
import type { ScanApi } from "../client/scan-api.js";
import { AppRoute, parseRoute, reportRouter } from "./route.js";
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

const enterRoute = (model: AppModel, route: AppRouteState): AppUpdate => {
  const generation = model.generation + 1;

  const entered: AppModel = {
    ...model,
    generation,
    route,
    scan: Schema.is(AppRoute.Report)(route)
      ? ScanState.Loading()
      : ScanState.Idle(),
    start: StartState.Idle(),
  };

  return Schema.is(AppRoute.Report)(route)
    ? {
        commands: [GetScan({ generation, slug: route.slug.toLowerCase() })],
        model: entered,
      }
    : { model: entered };
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
      generation: 0,
      route: AppRoute.Home(),
      scan: ScanState.Idle(),
      start: StartState.Idle(),
      url: "",
    },
    parseRoute(url)
  );

export const update = (model: AppModel, message: AppMessage): AppUpdate =>
  Message.match<AppUpdate>(message, {
    ChangedUrl: ({ url }) => enterRoute(model, parseRoute(url)),
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
    SubmittedScanForm: () => submitScan(model),
    SucceededGetScan: ({ generation, view }) =>
      generation === model.generation ? readScan(model, view) : { model },
    SucceededStartScan: ({ generation, slug }) =>
      generation === model.generation
        ? { commands: [Navigate({ url: reportRouter({ slug }) })], model }
        : { model },
    TickedPoll: () =>
      Option.match(pollTarget(model), {
        onNone: () => ({ model }),
        onSome: (slug) => ({
          commands: [GetScan({ generation: model.generation, slug })],
          model,
        }),
      }),
    UpdatedScanUrl: ({ value }) => ({
      model: modifyFields(model, {
        start: (start) =>
          Schema.is(StartState.Submitting)(start) ? start : StartState.Idle(),
        url: () => value,
      }),
    }),
  });
