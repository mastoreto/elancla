import { getApiEnv } from "../../env";
import { getMailer } from "../../mail";
import { type Auth, createAuth } from "../createAuth";

let current: Auth | undefined;

/**
 * Shared Better Auth instance. Lazy like `getApiEnv`: it is built on the first request, never at
 * import time, so `next build` does not need runtime secrets.
 */
export function getAuth(): Auth {
  if (current) return current;
  const env = getApiEnv();
  const hasGoogle =
    env.GOOGLE_CLIENT_ID !== "" && env.GOOGLE_CLIENT_SECRET !== "";
  current = createAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    crmOrigin: env.CRM_ORIGIN,
    mailer: getMailer(),
    google: hasGoogle
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
  });
  return current;
}
