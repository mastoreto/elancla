import type { InboxItemDto } from "@ancla/contracts";
import type { RevisionRow } from "../../data";
import { editorialTypeOf } from "../../registry";

/** `at` is when the revision reached the inbox: when it was sent, or when changes were asked. */
export function toInboxItemDto(
  row: RevisionRow,
  at: Date | null,
): InboxItemDto {
  const definition = editorialTypeOf(row.contentType);
  return {
    revisionId: row.id,
    contentType: definition.param,
    entityId: row.entityId,
    number: row.number,
    author: row.author,
    comment: row.comment,
    at: (at ?? row.updatedAt).toISOString(),
    crmPath: definition.crmPath(row.entityId),
  };
}
