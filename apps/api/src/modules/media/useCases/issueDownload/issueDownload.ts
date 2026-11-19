import {
  AUDIT_ACTIONS,
  type DownloadLinkDto,
  mediaPurposeOf,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import { scopeOf } from "../../../../core/authz";
import type { AuthenticatedContext } from "../../../../core/context";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../../core/errors";
import { getStorage } from "../../../../core/storage";
import { findMediaFileRow } from "../../data";
import { canDownload } from "../../domain";

/** Short on purpose: a leaked link stops working a minute later. */
export const DOWNLOAD_URL_TTL_SECONDS = 60;

/**
 * Signs a one-minute download link for a private file. The audit row is written first and strictly:
 * if the trail cannot record the access, no URL is issued.
 */
export async function issueDownload(
  ctx: AuthenticatedContext,
  id: string,
): Promise<DownloadLinkDto> {
  const row = await findMediaFileRow(ctx.organizationId, id);
  if (!row) throw new NotFoundError("The file was not found");

  const { downloadPermission } = mediaPurposeOf(row.purpose);
  if (!downloadPermission) {
    throw new ConflictError("Public files are served from their public URL");
  }
  const scope = scopeOf(ctx.access, downloadPermission);
  if (scope === null) throw new ForbiddenError();
  if (row.status !== "ready") throw new ConflictError("The file is not ready");
  if (
    !canDownload({ scope, uploadedById: row.uploadedById, userId: ctx.user.id })
  ) {
    throw new ForbiddenError();
  }

  await writeAudit(db, auditSourceFrom(ctx, ctx.organizationId), {
    action: AUDIT_ACTIONS.media.downloadIssued,
    entity: { type: "mediaFile", id },
    metadata: { entityLabel: row.originalName, purpose: row.purpose },
  });
  const link = await getStorage("private").presignDownload({
    key: row.key,
    expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
    fileName: row.originalName,
  });
  return { url: link.url, expiresAt: link.expiresAt.toISOString() };
}
