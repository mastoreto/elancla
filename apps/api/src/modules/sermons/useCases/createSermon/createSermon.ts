import {
  AUDIT_ACTIONS,
  type CreateSermonBody,
  type CreateSermonResponse,
} from "@ancla/contracts";
import { db, type Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import { withTransaction } from "../../../../core/db";
import { NotFoundError } from "../../../../core/errors";
import type { VideoInfo } from "../../../../core/platforms";
import {
  createDraftRevision,
  isUniqueViolation,
  nextRevisionNumber,
} from "../../../editorial";
import {
  createSermonLinkRow,
  createSermonRow,
  findOrganizationSermonConfig,
  isVideoLinked,
} from "../../data";
import {
  buildSermonDraft,
  toPlatformLinkFields,
  VideoAlreadyLinkedError,
  youtubeWatchUrl,
} from "../../domain";
import { fetchVideo } from "../fetchVideo";
import { resolveSermonSeries } from "../resolveSermonSeries";

async function createFromVideo(
  ctx: AuthenticatedContext,
  video: VideoInfo,
  body: CreateSermonBody,
): Promise<CreateSermonResponse> {
  return withTransaction(db, async (tx) => {
    const config = await findOrganizationSermonConfig(tx, ctx.organizationId);
    if (!config) throw new NotFoundError("The organization was not found");
    if (await isVideoLinked(tx, ctx.organizationId, video.id)) {
      throw new VideoAlreadyLinkedError();
    }
    const series = await resolveSermonSeries(tx, ctx, config, body);

    const sermon = await createSermonRow(tx, ctx.organizationId);
    await createSermonLinkRow(tx, {
      ...toPlatformLinkFields(video, new Date()),
      organizationId: ctx.organizationId,
      sermonId: sermon.id,
      externalId: video.id,
      url: youtubeWatchUrl(video.id),
    });
    const snapshot = buildSermonDraft({
      video,
      locale: config.defaultLocale,
      timezone: config.timezone,
      series,
    });
    const key = {
      organizationId: ctx.organizationId,
      contentType: "SERMON",
      entityId: sermon.id,
    } as const;
    await createDraftRevision(tx, {
      key,
      number: await nextRevisionNumber(tx, key),
      authorId: ctx.user.id,
      snapshot: snapshot as unknown as Prisma.InputJsonObject,
    });
    await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
      action: AUDIT_ACTIONS.sermon.created,
      entity: { type: "sermon", id: sermon.id },
      after: {
        id: sermon.id,
        videoId: video.id,
        ...(series ? { seriesId: series.id } : {}),
      },
    });
    return { id: sermon.id };
  });
}

/**
 * Creates a sermon from a pasted video: the video is read again from the platform, and then, in
 * one transaction, the `Sermon`, its `PlatformLink`, the series (an existing one, or a minimal
 * new one by title) and a DRAFT revision preloaded with the video's title, description and date
 * go in. A bad, private, missing or already linked video creates nothing.
 */
export async function createSermon(
  ctx: AuthenticatedContext,
  body: CreateSermonBody,
): Promise<CreateSermonResponse> {
  const video = await fetchVideo(body.video);
  try {
    return await createFromVideo(ctx, video, body);
  } catch (error) {
    // Two requests for the same video race on `@@unique([organizationId, platform, externalId])`.
    if (isUniqueViolation(error)) throw new VideoAlreadyLinkedError();
    throw error;
  }
}
