import { db } from "@ancla/db";
import { withTransaction } from "../../../../core/db";
import { getApiEnv } from "../../../../core/env";
import { listLiveSnapshots } from "../../../editorial";
import {
  deleteVisitorsBefore,
  findOrganizationBlogConfig,
  incrementDailyViews,
  insertVisitorIfNew,
  listPostRows,
} from "../../data";
import {
  buildBlogEntries,
  findVisibleEntryBySlug,
  isKnownBot,
  urlDate,
  visitorHash,
} from "../../domain";

interface RecordPostViewInput {
  organizationId: string;
  slug: string;
  /** The visitor's address and user agent: they only feed the hash and are never stored. */
  ip: string;
  userAgent: string;
  now?: Date;
}

/**
 * Counts one anonymous view of a visible post: once per visitor and day. Bots, unknown posts and
 * posts that are not visible (draft, paused, scheduled) are ignored silently: the caller answers
 * the same 204 whatever happened, so the endpoint does not tell who counted.
 */
export async function recordPostView({
  organizationId,
  slug,
  ip,
  userAgent,
  now = new Date(),
}: RecordPostViewInput): Promise<void> {
  if (isKnownBot(userAgent)) return;
  const config = await findOrganizationBlogConfig(db, organizationId);
  if (!config) return;
  const [live, posts] = await Promise.all([
    listLiveSnapshots(organizationId, "BLOG_POST"),
    listPostRows(organizationId),
  ]);
  const firstLiveByPost = new Map(
    posts.flatMap(({ id, firstLiveAt }) =>
      firstLiveAt ? [[id, firstLiveAt] as const] : [],
    ),
  );
  // ponytail: in-memory scan, index slugs if posts grow past ~1000
  const entry = findVisibleEntryBySlug(
    buildBlogEntries(live, firstLiveByPost, now),
    slug,
  );
  if (!entry) return;

  const day = urlDate(now, config.timezone);
  const hash = visitorHash({
    secret: getApiEnv().VIEW_HASH_SECRET,
    day,
    ip,
    userAgent,
  });
  await withTransaction(db, async (tx) => {
    const isNewVisitor = await insertVisitorIfNew(tx, {
      postId: entry.postId,
      day,
      visitorHash: hash,
    });
    if (!isNewVisitor) return;
    await incrementDailyViews(tx, entry.postId, day);
    await deleteVisitorsBefore(tx, entry.postId, day);
  });
}
