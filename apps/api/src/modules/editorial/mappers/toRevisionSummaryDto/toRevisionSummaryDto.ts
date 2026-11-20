import type {
  EditorialActionDto,
  EditorialStateDto,
  EditorialStatusDto,
  RevisionSummaryDto,
} from "@ancla/contracts";
import type { EditorialState } from "@ancla/db";
import type { RevisionRow } from "../../data";

const isoOrNull = (date: Date | null): string | null =>
  date?.toISOString() ?? null;

export function toStateDto(state: EditorialState): EditorialStateDto {
  return state.toLowerCase() as EditorialStateDto;
}

export function toRevisionSummaryDto(row: RevisionRow): RevisionSummaryDto {
  return {
    id: row.id,
    number: row.number,
    state: toStateDto(row.state),
    author: row.author,
    reviewer: row.reviewer,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
    submittedAt: isoOrNull(row.submittedAt),
    decidedAt: isoOrNull(row.decidedAt),
    publishedAt: isoOrNull(row.publishedAt),
  };
}

/** What the audit trail keeps of a revision: never the snapshot, which can be long and is not an event. */
export function toRevisionAuditSummary(row: RevisionRow) {
  return {
    id: row.id,
    number: row.number,
    state: toStateDto(row.state),
    authorId: row.authorId,
  };
}

interface StatusParts {
  live: RevisionRow | null;
  working: RevisionRow | null;
  availableActions: EditorialActionDto[];
}

export function toEditorialStatusDto({
  live,
  working,
  availableActions,
}: StatusParts): EditorialStatusDto {
  return {
    live: live ? toRevisionSummaryDto(live) : null,
    working: working
      ? {
          ...toRevisionSummaryDto(working),
          snapshot: working.snapshot as Record<string, unknown>,
        }
      : null,
    availableActions,
  };
}
