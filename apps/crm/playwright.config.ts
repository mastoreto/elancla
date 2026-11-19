import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { WEB_PORT, WEB_URL } from "./e2e/support/urls";

const E2E_PORT = 3100;
const BASE_URL = `http://localhost:${E2E_PORT}`;
const MONOREPO_ROOT = path.resolve(__dirname, "../..");
const TEST_ENV_FILE = path.resolve(__dirname, "../../.env.test");

const WEB_ENTRYPOINT = "apps/web/dist/server/entry.mjs";
if (!fs.existsSync(path.join(MONOREPO_ROOT, WEB_ENTRYPOINT))) {
  throw new Error(
    "The web is not built: run `env -u DATABASE_URL bun run --filter web build` before the E2E suite.",
  );
}

// The CRM server must talk to the ephemeral test database, never to a developer's .env.
const testEnv = loadEnv({ path: TEST_ENV_FILE, processEnv: {} }).parsed ?? {};

// Specs run against built output: build first (`bun --env-file=.env.test run --filter crm build`
// and `env -u DATABASE_URL bun run --filter web build`).
export default defineConfig({
  testDir: "e2e",
  // Flows share one database and one server; running them in order keeps failures readable.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/setup/globalSetup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `bun run start -p ${E2E_PORT}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { ...(process.env as Record<string, string>), ...testEnv },
    },
    {
      // The public site reads the CRM's public API with the key seeded from .env.test. Probe a
      // static file: the home answers 503 while the site is in maintenance.
      command: `node ${WEB_ENTRYPOINT}`,
      cwd: MONOREPO_ROOT,
      url: `${WEB_URL}/favicon.svg`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        ...(process.env as Record<string, string>),
        ...testEnv,
        HOST: "127.0.0.1",
        PORT: String(WEB_PORT),
      },
    },
  ],
});
