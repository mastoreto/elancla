// Writes the OpenAPI contracts to packages/contracts/openapi/: private.json (the whole API) and
// public-v1.json (the public content API, the contract any church site consumes).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// Importing the app loads @ancla/db, which needs DATABASE_URL (no connection is opened).
loadEnv({ path: path.resolve(scriptDir, "../../../../../.env") });

const { app } = await import("../../app");
const { publicRoutes } = await import("../../modules/public");
const { openApiConfig, publicOpenApiConfig } = await import(
  "../../core/openapi"
);

const outputDirectory = path.resolve(
  scriptDir,
  "../../../../../packages/contracts/openapi",
);

function writeDocument(fileName: string, document: unknown): void {
  const outputFile = path.join(outputDirectory, fileName);
  writeFileSync(outputFile, `${JSON.stringify(document, null, 2)}\n`);
  console.info(`OpenAPI written to ${outputFile}`);
}

mkdirSync(outputDirectory, { recursive: true });
writeDocument("private.json", app.getOpenAPI31Document(openApiConfig));
writeDocument(
  "public-v1.json",
  publicRoutes.getOpenAPI31Document(publicOpenApiConfig),
);
