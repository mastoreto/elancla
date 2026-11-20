import type { BlogPostSnapshot, PostListItemDto } from "@ancla/contracts";
import { type RevisionRow, toRevisionSummaryDto } from "../../../editorial";
import type { PostViewTotals } from "../../data";

interface PostListInput {
  id: string;
  defaultLocale: string;
  live: RevisionRow | null;
  working: RevisionRow | null;
  /** Names by id, already resolved to the organization's default language. */
  categoryNames: ReadonlyMap<string, string>;
  authorNames: ReadonlyMap<string, string>;
  views: PostViewTotals | undefined;
}

/** The revision being edited wins over the published one: it is what the CRM list should show. */
export function toPostListItemDto({
  id,
  defaultLocale,
  live,
  working,
  categoryNames,
  authorNames,
  views,
}: PostListInput): PostListItemDto {
  const current = working ?? live;
  const snapshot = current?.snapshot as unknown as BlogPostSnapshot | undefined;
  const categoryName = snapshot && categoryNames.get(snapshot.categoryId);
  const authorName = snapshot && authorNames.get(snapshot.authorProfileId);
  return {
    id,
    title: snapshot?.translations[defaultLocale]?.title ?? null,
    category:
      snapshot && categoryName !== undefined
        ? { id: snapshot.categoryId, name: categoryName }
        : null,
    author:
      snapshot && authorName !== undefined
        ? { id: snapshot.authorProfileId, name: authorName }
        : null,
    live: live ? toRevisionSummaryDto(live) : null,
    working: working ? toRevisionSummaryDto(working) : null,
    views30d: views?.views30d ?? 0,
    viewsTotal: views?.viewsTotal ?? 0,
  };
}
