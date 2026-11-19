import {
  AUDIT_ACTIONS,
  type CreateUploadBody,
  mediaPurposeOf,
  type UploadTicketDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { uuidV7 } from "../../../../core/ids";
import { getStorage } from "../../../../core/storage";
import { createMediaFileRow } from "../../data";
import { originalKey, sanitizeFileName } from "../../domain";
import { assertCanUpload } from "../../policies";

/** Long enough to upload 20 MB on a slow connection, short enough to be worthless once leaked. */
export const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const MILLISECONDS_PER_SECOND = 1000;

interface RequestUploadInput {
  ctx: AuthenticatedContext;
  body: CreateUploadBody;
}

/**
 * Registers a pending file and hands the browser a presigned PUT into the private bucket
 * (quarantine). The URL is signed after the commit: a rolled-back row never has a live URL.
 */
export async function requestUpload({
  ctx,
  body,
}: RequestUploadInput): Promise<UploadTicketDto> {
  assertCanUpload(ctx.access, body.purpose);
  const id = uuidV7();
  const key = originalKey(ctx.organizationId, id);
  const originalName = sanitizeFileName(body.fileName);

  await withTransaction(db, async (tx) => {
    await createMediaFileRow(tx, ctx.organizationId, {
      id,
      purpose: body.purpose,
      key,
      contentType: body.contentType,
      size: body.size,
      originalName,
      uploadedById: ctx.user.id,
    });
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.media.uploadRequested,
      entity: { type: "mediaFile", id },
      after: {
        purpose: body.purpose,
        contentType: body.contentType,
        size: body.size,
        visibility: mediaPurposeOf(body.purpose).visibility,
      },
      metadata: { entityLabel: originalName },
    });
  });

  const presigned = await getStorage("private").presignUpload({
    key,
    contentType: body.contentType,
    size: body.size,
    expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
  });
  return {
    id,
    uploadUrl: presigned.url,
    headers: presigned.headers,
    expiresAt: new Date(
      Date.now() + UPLOAD_URL_TTL_SECONDS * MILLISECONDS_PER_SECOND,
    ).toISOString(),
  };
}
