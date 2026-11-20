import type { PublicBlogIndexDto } from "@ancla/contracts";
import { pickPopular, sumPostViews, viewsWindowStart } from "../../../blog";
import { toPublicBlogIndexDto } from "../../mappers";
import { loadBlogCorpus } from "../loadBlogCorpus";

/**
 * The blog home: the visible posts and everything the page shows next to them. Drafts and paused
 * posts are absent; a scheduled post only shows as the `next` entry of its series.
 */
export async function getPublicBlogIndex(input: {
  organizationId: string;
  requestedLocale: string | undefined;
}): Promise<PublicBlogIndexDto> {
  const { organizationId, requestedLocale } = input;
  const now = new Date();
  const { entries, ctx } = await loadBlogCorpus({
    organizationId,
    requestedLocale,
    now,
  });
  const views = await sumPostViews(
    organizationId,
    viewsWindowStart(now, ctx.timeZone),
  );
  const recentViews = new Map(
    [...views].map(([postId, totals]) => [postId, totals.views30d]),
  );
  const popularIds = pickPopular(
    entries.filter((entry) => entry.visible),
    recentViews,
  );
  return toPublicBlogIndexDto({ entries, ctx, popularIds });
}
