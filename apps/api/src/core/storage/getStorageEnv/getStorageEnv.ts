import { z } from "zod";

const MIN_CRON_SECRET_LENGTH = 32;

const storageEnvSchema = z.object({
  /** Where the API talks to the storage (inside compose: http://s3:9000). */
  S3_ENDPOINT: z.url(),
  /** Host the browser sees, when it differs from `S3_ENDPOINT`. */
  S3_PRESIGN_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_PRIVATE_BUCKET: z.string().min(1),
  S3_PRIVATE_KEY_ID: z.string().min(1),
  S3_PRIVATE_SECRET: z.string().min(1),
  S3_PUBLIC_BUCKET: z.string().min(1),
  S3_PUBLIC_KEY_ID: z.string().min(1),
  S3_PUBLIC_SECRET: z.string().min(1),
  /** Base of the public variants (the CDN in production), without trailing slash. */
  MEDIA_PUBLIC_BASE_URL: z
    .url()
    .transform((value) => value.replace(/\/+$/, "")),
  CRON_SECRET: z.string().min(MIN_CRON_SECRET_LENGTH),
});

export type StorageEnv = z.infer<typeof storageEnvSchema>;

let cached: StorageEnv | undefined;

/**
 * Validated storage environment. Separate and lazy on purpose: the `invite` CLI and the rest of
 * the API do not need S3 credentials, so nothing fails until the first media operation.
 */
export function getStorageEnv(): StorageEnv {
  if (cached) return cached;
  const result = storageEnvSchema.safeParse(process.env);
  if (!result.success) {
    const names = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Invalid storage environment: ${names}`);
  }
  cached = result.data;
  return cached;
}
