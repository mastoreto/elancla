import type { PlatformLookupBody, PlatformLookupDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import type { AuthenticatedContext } from "../../../../core/context";
import { isVideoLinked } from "../../data";
import { fetchVideo } from "../fetchVideo";

/**
 * Preview of a pasted video before anything is created. The same lookup serves sermons and
 * podcast episodes (`for`): a video already linked to either is `alreadyLinked`. Creates nothing.
 */
export async function lookupVideo(
  ctx: AuthenticatedContext,
  { input }: PlatformLookupBody,
): Promise<PlatformLookupDto> {
  const video = await fetchVideo(input);
  return {
    externalId: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    durationSeconds: video.durationSeconds,
    publishedAt: new Date(video.publishedAt).toISOString(),
    alreadyLinked: await isVideoLinked(db, ctx.organizationId, video.id),
  };
}
