export interface PausedRequest {
  readonly request: { readonly url: string };
  readonly requestId: string;
  readonly resourceType: string;
}

export interface SessionRequest {
  abort: (errorCode?: "blockedbyclient") => Promise<void>;
  continue: () => Promise<void>;
  frame: () => object | null;
  isInterceptResolutionHandled: () => boolean;
  isNavigationRequest: () => boolean;
  redirectChain: () => readonly object[];
  respond: (response: {
    readonly body: string;
    readonly status: number;
  }) => Promise<void>;
  url: () => string;
}

export interface SessionResponse {
  headers: () => Record<string, string>;
  status: () => number;
}

export interface SessionKeyboard {
  down: (key: "Shift") => Promise<void>;
  press: (key: "Tab") => Promise<void>;
  up: (key: "Shift") => Promise<void>;
}

export interface SessionPage {
  close: () => Promise<void>;
  content: () => Promise<string>;
  // oxlint-disable-next-line anti-slop/no-unknown-returns -- The page script's result is whatever the scanned page's JavaScript returns; every caller decodes it with a schema.
  evaluate: (expression: string) => Promise<unknown>;
  evaluateOnNewDocument: (source: string) => Promise<object>;
  goto: (
    url: string,
    options: { readonly timeout: number; readonly waitUntil: "load" }
  ) => Promise<SessionResponse | null>;
  readonly keyboard: SessionKeyboard;
  mainFrame: () => object;
  on: (event: "request", handler: (request: SessionRequest) => void) => void;
  setBypassServiceWorker: (bypass: boolean) => Promise<void>;
  setOfflineMode: (enabled: boolean) => Promise<void>;
  setRequestInterception: (enabled: boolean) => Promise<void>;
  setUserAgent: (userAgent: string) => Promise<void>;
  setViewport: (viewport: {
    readonly height: number;
    readonly width: number;
  }) => Promise<void>;
  url: () => string;
}

export interface FetchCommands {
  "Fetch.enable": { patterns: { urlPattern: string }[] };
  "Fetch.failRequest": { errorReason: "BlockedByClient"; requestId: string };
  "Fetch.fulfillRequest": { requestId: string; responseCode: number };
}

export interface SessionCdp {
  on: (
    event: "Fetch.requestPaused",
    handler: (paused: PausedRequest) => void
  ) => void;
  send: ((
    method: "Fetch.enable",
    params: FetchCommands["Fetch.enable"]
  ) => Promise<void>) &
    ((
      method: "Fetch.failRequest",
      params: FetchCommands["Fetch.failRequest"]
    ) => Promise<void>) &
    ((
      method: "Fetch.fulfillRequest",
      params: FetchCommands["Fetch.fulfillRequest"]
    ) => Promise<void>);
}

export interface SessionTarget {
  createCDPSession: () => Promise<SessionCdp>;
  page: () => Promise<SessionPage | null>;
  type: () => string;
}

export interface SessionBrowser {
  close: () => Promise<void>;
  newPage: () => Promise<SessionPage>;
  on: (
    event: "targetcreated",
    handler: (target: SessionTarget) => void
  ) => void;
  target: () => SessionTarget;
}
