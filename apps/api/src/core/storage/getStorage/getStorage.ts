import { createS3Storage } from "../createS3Storage";
import { getStorageEnv } from "../getStorageEnv";
import type { FileStorage, StorageVisibility } from "../types";

const instances = new Map<StorageVisibility, FileStorage>();

/** The storage of one bucket, built on first use with the credentials of that bucket only. */
export function getStorage(visibility: StorageVisibility): FileStorage {
  const existing = instances.get(visibility);
  if (existing) return existing;
  const env = getStorageEnv();
  const created = createS3Storage({
    endpoint: env.S3_ENDPOINT,
    presignEndpoint: env.S3_PRESIGN_ENDPOINT,
    region: env.S3_REGION,
    ...(visibility === "private"
      ? {
          bucket: env.S3_PRIVATE_BUCKET,
          accessKeyId: env.S3_PRIVATE_KEY_ID,
          secretAccessKey: env.S3_PRIVATE_SECRET,
        }
      : {
          bucket: env.S3_PUBLIC_BUCKET,
          accessKeyId: env.S3_PUBLIC_KEY_ID,
          secretAccessKey: env.S3_PUBLIC_SECRET,
        }),
  });
  instances.set(visibility, created);
  return created;
}
