import { getApiEnv } from "../../src/core/env";

interface AuthRequestOptions {
  cookie?: string;
  ip?: string;
}

/** A JSON POST as the CRM's browser client sends it to Better Auth. */
export function authPost(
  path: string,
  body: unknown,
  options: AuthRequestOptions = {},
): Request {
  const env = getApiEnv();
  return new Request(`${env.BETTER_AUTH_URL}/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: env.CRM_ORIGIN,
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...(options.ip ? { "X-Forwarded-For": options.ip } : {}),
    },
    body: JSON.stringify(body),
  });
}
