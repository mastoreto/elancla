import { execSync } from "node:child_process";
import path from "node:path";

const MONOREPO_ROOT = path.resolve(__dirname, "../../../..");

/** Creates (idempotently) the accounts the specs sign in with, in the test database. */
export default function globalSetup(): void {
  execSync("bun --env-file=.env.test run --filter @ancla/api seed:e2e", {
    cwd: MONOREPO_ROOT,
    stdio: "inherit",
  });
}
