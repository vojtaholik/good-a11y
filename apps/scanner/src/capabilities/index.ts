import { getScan } from "./get-scan.js";
import { sendMessage } from "./send-message.js";
import { startScan } from "./start-scan.js";

export { getScan } from "./get-scan.js";

export { sendMessage } from "./send-message.js";

export { startScan } from "./start-scan.js";

export const siteCapabilities = [startScan, getScan, sendMessage] as const;
