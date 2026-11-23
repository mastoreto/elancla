import { z } from "zod";

const apiEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  // Normalized to a bare origin so it compares equal to the browser's `Origin` header.
  CRM_ORIGIN: z.url().transform((value) => new URL(value).origin),
  // Empty or missing disables Google sign-in, so local work and tests do not need credentials.
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  // Empty or missing disables the video platform (`getVideoPlatform()` is null): lookup answers
  // 503 and the live check says "not live".
  YOUTUBE_API_KEY: z.string().default(""),
  SMTP_URL: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  // Secret of the anonymous post-view hash (HMAC of day + ip + user agent).
  VIEW_HASH_SECRET: z.string().min(32),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

let cached: ApiEnv | undefined;

/**
 * Validated environment of the API. Lazy on purpose: it runs on the first request, never at
 * import time, so `next build` does not need runtime secrets.
 * ponytail: lives here until phase 0.8 moves per-app env schemas into packages/env.
 */
export function getApiEnv(): ApiEnv {
  if (cached) return cached;
  const result = apiEnvSchema.safeParse(process.env);
  if (!result.success) {
    const names = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Invalid API environment: ${names}`);
  }
  cached = result.data;
  return cached;
}
