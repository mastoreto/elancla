import { AUDIT_ACTIONS, type PlatformLinkDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import {
  findSermonLink,
  findSermonRow,
  updatePlatformLinkFields,
} from "../../data";
import {
  toPlatformLinkFields,
  VideoNotFoundError,
  VideoPrivateError,
} from "../../domain";
import { toPlatformLinkDto } from "../../mappers";
import { withVideoPlatform } from "../withVideoPlatform";

/**
 * Reads the video again and rewrites its `PlatformLink` (cover, duration, views, original date).
 * Only the link changes: the title, summary and everything else the editors wrote live in the
 * snapshot, which refreshing never touches. A video that went private or was removed is an error
 * (422 `video_private`, 404 `video_not_found`) and leaves the link as it was.
 */
export async function refreshSermonPlatform(
  ctx: AuthenticatedContext,
  id: string,
): Promise<PlatformLinkDto> {
  const sermon = await findSermonRow(db, ctx.organizationId, id);
  const link = sermon && (await findSermonLink(db, ctx.organizationId, id));
  if (!link) throw new NotFoundError("The sermon has no video to refresh");

  const video = await withVideoPlatform((platform) =>
    platform.getVideo(link.externalId),
  );
  if (video === "not_found") throw new VideoNotFoundError();
  if (video === "private") throw new VideoPrivateError();

  return withTransaction(db, async (tx) => {
    const updated = toPlatformLinkDto(
      await updatePlatformLinkFields(
        tx,
        link.id,
        toPlatformLinkFields(video, new Date()),
      ),
    );
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermon.platformRefreshed,
      entity: { type: "sermon", id },
      before: toPlatformLinkDto(link),
      after: updated,
    });
    return updated;
  });
}
