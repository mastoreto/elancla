import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

const E2E_PORT = 3100;
const BASE_URL = `http://localhost:${E2E_PORT}`;
const TEST_ENV_FILE = path.resolve(__dirname, "../../.env.test");

// The CRM server must talk to the ephemeral test database, never to a developer's .env.
const testEnv = loadEnv({ path: TEST_ENV_FILE, processEnv: {} }).parsed ?? {};

// Specs run against `next build` output: build first (`bun --env-file=.env.test run --filter crm build`).
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
  webServer: {
    command: `bun run start -p ${E2E_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { ...(process.env as Record<string, string>), ...testEnv },
  },
});
