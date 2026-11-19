import { type CreateAuthOptions, createAuth } from "../../src/core/auth";
import { getApiEnv } from "../../src/core/env";
import { createRecordingMailer } from "./recordingMailer";

/** Auth instance for tests: real Better Auth and database, fake mailer, rate limit off. */
export function createTestAuth(overrides: Partial<CreateAuthOptions> = {}) {
  const env = getApiEnv();
  const mailer = createRecordingMailer();
  const auth = createAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    crmOrigin: env.CRM_ORIGIN,
    mailer,
    rateLimitEnabled: false,
    ...overrides,
  });
  return { auth, mailer };
}
