import { fileURLToPath } from "node:url";

export const scanStoreMigrationDirectory = fileURLToPath(
  new URL("../migrations/d1/", import.meta.url)
);

export const scanStoreSchemaFile = fileURLToPath(
  new URL("../src/schema/d1.ts", import.meta.url)
);
