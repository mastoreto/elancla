// Test preload: loads the monorepo root .env (DATABASE_URL) without overriding the environment.
// ponytail: integration tests use the local Docker database and clean up after themselves;
// phase 0.7 brings an isolated test database.
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(import.meta.dir, "../../../../.env") });
