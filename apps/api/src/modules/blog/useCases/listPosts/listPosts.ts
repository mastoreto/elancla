import type { BlogPostSnapshot, PostListDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { listCurrentRevisionRows, type RevisionRow } from "../../../editorial";
import {
  findAuthorNames,
  findCategoryNames,
  findOrganizationBlogConfig,
  listPostRows,
  sumPostViews,
} from "../../data";
import { viewsWindowStart } from "../../domain";
import { toPostListItemDto } from "../../mappers";

const LIVE_STATES = ["PUBLISHED", "PAUSED"];

const snapshotOf = (row: RevisionRow): BlogPostSnapshot =>
  row.snapshot as unknown as BlogPostSnapshot;

function nameInLocale(
  translations: { locale: string; name: string }[],
  locale: string,
): string {
  return (
    (translations.find((entry) => entry.locale === locale) ?? translations[0])
      ?.name ?? ""
  );
}

/**
 * Every post with its live and working revision, its category and author names and its views,
 * in a fixed number of queries whatever the count.
 */
export async function listPosts(
  organizationId: string,
  now: Date = new Date(),
): Promise<PostListDto> {
  const config = await findOrganizationBlogConfig(db, organizationId);
  const defaultLocale = config?.defaultLocale ?? "";
  const [posts, revisions] = await Promise.all([
    listPostRows(organizationId),
    listCurrentRevisionRows(organizationId, "BLOG_POST"),
  ]);
  const snapshots = revisions.map(snapshotOf);
  const [categories, authors, views] = await Promise.all([
    findCategoryNames(organizationId, [
      ...new Set(snapshots.map((s) => s.categoryId)),
    ]),
    findAuthorNames(organizationId, [
      ...new Set(snapshots.map((s) => s.authorProfileId)),
    ]),
    sumPostViews(
      organizationId,
      viewsWindowStart(now, config?.timezone ?? "UTC"),
    ),
  ]);
  const categoryNames = new Map(
    categories.map(({ id, translations }) => [
      id,
      nameInLocale(translations, defaultLocale),
    ]),
  );
  const authorNames = new Map(authors.map(({ id, name }) => [id, name]));

  const byEntity = new Map<string, RevisionRow[]>();
  for (const revision of revisions) {
    byEntity.set(revision.entityId, [
      ...(byEntity.get(revision.entityId) ?? []),
      revision,
    ]);
  }
  return {
    items: posts.map(({ id }) => {
      const own = byEntity.get(id) ?? [];
      return toPostListItemDto({
        id,
        defaultLocale,
        live: own.find((row) => LIVE_STATES.includes(row.state)) ?? null,
        working: own.find((row) => !LIVE_STATES.includes(row.state)) ?? null,
        categoryNames,
        authorNames,
        views: views.get(id),
      });
    }),
  };
}
