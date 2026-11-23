import { createHash } from "node:crypto";
import {
  AUDIT_ACTIONS,
  isImageContentType,
  type MediaFileDto,
  mediaPurposeOf,
} from "@ancla/contracts";
import type { MediaFile } from "@ancla/db";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from "../../../../core/errors";
import { getStorage, getStorageEnv } from "../../../../core/storage";
import {
  deleteMediaFileRow,
  findMediaFileRow,
  markMediaFileReady,
} from "../../data";
import {
  detectContentType,
  documentKey,
  type StoredVariant,
  variantKey,
} from "../../domain";
import { renderVariants } from "../../lib";
import { toMediaFileDto } from "../../mappers";

const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

type RejectionReason =
  | "objectMissing"
  | "sizeMismatch"
  | "contentTypeMismatch"
  | "unreadableImage";

const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  objectMissing: "The file was never uploaded",
  sizeMismatch: "The uploaded file is not the size that was declared",
  contentTypeMismatch:
    "The content of the file is not the type that was declared",
  unreadableImage: "The image cannot be read",
};

class Rejection extends Error {
  constructor(
    readonly reason: RejectionReason,
    readonly details: Record<string, unknown> = {},
  ) {
    super(reason);
  }
}

const sha256Hex = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex");

interface VerifiedFile {
  size: number;
  checksum: string;
  variants: StoredVariant[] | null;
}

/** Reads the quarantined original and proves it is what was declared. Throws `Rejection`. */
async function verifyOriginal(row: MediaFile): Promise<{
  size: number;
  checksum: string;
  bytes: Uint8Array;
}> {
  const privateStorage = getStorage("private");
  const purpose = mediaPurposeOf(row.purpose);
  const head = await privateStorage.head(row.key);
  if (!head) throw new Rejection("objectMissing");
  if (head.size !== row.size || head.size > purpose.maxBytes) {
    throw new Rejection("sizeMismatch", {
      declared: row.size,
      actual: head.size,
    });
  }
  const bytes = await privateStorage.get(row.key);
  const detected = detectContentType(bytes);
  if (detected !== row.contentType) {
    throw new Rejection("contentTypeMismatch", {
      declared: row.contentType,
      detected,
    });
  }
  return { size: bytes.byteLength, checksum: sha256Hex(bytes), bytes };
}

/** Renders the variants into the public bucket, recording each stored one in `stored`. */
async function publishVariants(
  row: MediaFile,
  bytes: Uint8Array,
  stored: StoredVariant[],
  publishedKeys: string[],
): Promise<void> {
  const publicStorage = getStorage("public");
  const rendered = await renderVariants(bytes).catch((error: unknown) => {
    throw new Rejection("unreadableImage", {
      message: error instanceof Error ? error.message : String(error),
    });
  });
  for (const variant of rendered) {
    const key = variantKey(
      row.organizationId,
      row.id,
      variant.width,
      variant.format,
    );
    await publicStorage.put({
      key,
      body: variant.body,
      contentType: `image/${variant.format}`,
      cacheControl: IMMUTABLE_CACHE_CONTROL,
    });
    publishedKeys.push(key);
    stored.push({
      width: variant.width,
      height: variant.height,
      format: variant.format,
      key,
      size: variant.body.byteLength,
    });
  }
}

/** A public document is served as it was uploaded: the verified original, no variants. */
async function publishDocument(
  row: MediaFile,
  bytes: Uint8Array,
  publishedKeys: string[],
): Promise<void> {
  const key = documentKey(row.organizationId, row.id);
  await getStorage("public").put({
    key,
    body: bytes,
    contentType: row.contentType,
    cacheControl: IMMUTABLE_CACHE_CONTROL,
  });
  publishedKeys.push(key);
}

async function verifyAndPublish(row: MediaFile): Promise<{
  verified: VerifiedFile;
  publishedKeys: string[];
}> {
  const { size, checksum, bytes } = await verifyOriginal(row);
  const stored: StoredVariant[] = [];
  const publishedKeys: string[] = [];
  if (mediaPurposeOf(row.purpose).visibility === "public") {
    try {
      if (isImageContentType(row.contentType)) {
        await publishVariants(row, bytes, stored, publishedKeys);
      } else {
        await publishDocument(row, bytes, publishedKeys);
      }
    } catch (error) {
      // Do not leave half of a published set in the public bucket.
      await removePublished(publishedKeys);
      throw error;
    }
  }
  return {
    verified: { size, checksum, variants: stored.length > 0 ? stored : null },
    publishedKeys,
  };
}

async function removePublished(keys: string[]): Promise<void> {
  const publicStorage = getStorage("public");
  await Promise.allSettled(keys.map((key) => publicStorage.delete(key)));
}

/** Deletes the object and the row, audits the rejection, and answers 422. */
async function reject(
  ctx: AuthenticatedContext,
  row: MediaFile,
  rejection: Rejection,
): Promise<never> {
  await getStorage("private").delete(row.key);
  await withTransaction(db, async (tx) => {
    await deleteMediaFileRow(tx, ctx.organizationId, row.id);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.media.rejected,
      entity: { type: "mediaFile", id: row.id },
      outcome: "failure",
      metadata: {
        entityLabel: row.originalName,
        purpose: row.purpose,
        reason: rejection.reason,
        ...rejection.details,
      },
    });
  });
  throw new UnprocessableError(REJECTION_MESSAGES[rejection.reason]);
}

async function markReady(
  ctx: AuthenticatedContext,
  row: MediaFile,
  verified: VerifiedFile,
): Promise<MediaFileDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  return withTransaction(db, async (tx) => {
    const ready = await markMediaFileReady(
      tx,
      ctx.organizationId,
      row.id,
      verified,
    );
    if (!ready) throw new ConflictError("The file was already finalized");
    const dto = toMediaFileDto(ready, publicBaseUrl);
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.media.finalized,
      entity: { type: "mediaFile", id: row.id },
      after: { ...dto, checksum: verified.checksum },
      metadata: { entityLabel: row.originalName },
    });
    return dto;
  });
}

/**
 * Proves the quarantined upload is what was declared (size, then real type by magic bytes, then
 * SHA-256), publishes the variants of a public image (or the original of a public document) and marks the file ready. Only the uploader
 * may finalize, and only once. Anything that fails verification is deleted, never kept.
 */
export async function finalizeUpload(
  ctx: AuthenticatedContext,
  id: string,
): Promise<MediaFileDto> {
  const row = await findMediaFileRow(ctx.organizationId, id);
  if (!row || row.uploadedById !== ctx.user.id) {
    throw new NotFoundError("The file was not found");
  }
  if (row.status !== "pending") {
    throw new ConflictError("The file was already finalized");
  }

  let published: Awaited<ReturnType<typeof verifyAndPublish>>;
  try {
    published = await verifyAndPublish(row);
  } catch (error) {
    if (error instanceof Rejection) return reject(ctx, row, error);
    throw error;
  }
  try {
    return await markReady(ctx, row, published.verified);
  } catch (error) {
    // Published keys are deterministic: after a lost race the winner owns those very objects.
    if (!(error instanceof ConflictError))
      await removePublished(published.publishedKeys);
    throw error;
  }
}
