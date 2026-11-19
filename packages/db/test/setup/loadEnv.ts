// Test preload: loads the monorepo root .env.test (ephemeral db-test database, port 5434)
// without overriding variables that are already exported. Tests never read the dev .env.
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(import.meta.dir, "../../../../.env.test") });
