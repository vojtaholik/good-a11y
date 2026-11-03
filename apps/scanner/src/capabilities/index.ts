import { getScan } from "./get-scan.js";
import { startScan } from "./start-scan.js";

export { getScan } from "./get-scan.js";

export { startScan } from "./start-scan.js";

export const siteCapabilities = [startScan, getScan] as const;
