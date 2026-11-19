// Writes the private OpenAPI contract to packages/contracts/openapi/private.json.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// Importing the app loads @ancla/db, which needs DATABASE_URL (no connection is opened).
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { app } = await import("../../app");
const { openApiConfig } = await import("../../core/openapi");

const outputFile = path.resolve(
  scriptDir,
  "../../../../../packages/contracts/openapi/private.json",
);

mkdirSync(path.dirname(outputFile), { recursive: true });
writeFileSync(
  outputFile,
  `${JSON.stringify(app.getOpenAPI31Document(openApiConfig), null, 2)}\n`,
);
console.info(`OpenAPI written to ${outputFile}`);
