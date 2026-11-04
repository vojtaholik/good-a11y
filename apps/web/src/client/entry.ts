import "./base.css";
import { Runtime } from "foldkit";

import { init, update } from "../features/update.js";
import { view } from "../features/view.js";
import { Flags, Message, Model } from "./model.js";
import { subscriptions } from "./polling.js";
import { ScanApi } from "./scan-api.js";

const application = Runtime.makeApplication({
  Flags,
  Model,
  container: document.querySelector<HTMLElement>("#root"),
  devTools: false,
  init,
  resources: ScanApi.layer,
  routing: {
    onUrlChange: (url) => Message.ChangedUrl({ url }),
    onUrlRequest: (request) => Message.ClickedLink({ request }),
  },
  subscriptions,
  update,
  view,
});

Runtime.hydrate(application, { buildId: __BUILD_ID__ });
