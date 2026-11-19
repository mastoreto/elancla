import { type Page, type PageQuery, pageQuerySchema } from "@ancla/contracts";
import { ValidationError } from "../../errors";

/** Parses raw query params (cursor, limit); invalid input is a 400, never silently clamped. */
export function parsePageQuery(raw: unknown): PageQuery {
  const result = pageQuerySchema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError(
      "Invalid pagination parameters",
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

/**
 * Builds a page from rows fetched with `take: limit + 1`: the extra row only signals that
 * there is a next page, and the cursor is the id of the last row that is returned.
 */
export function toPage<Item extends { id: string }>(
  rows: Item[],
  limit: number,
): Page<Item> {
  const items = rows.slice(0, limit);
  const lastItem = items.at(-1);
  const hasMore = rows.length > limit;
  return { items, nextCursor: hasMore && lastItem ? lastItem.id : null };
}
