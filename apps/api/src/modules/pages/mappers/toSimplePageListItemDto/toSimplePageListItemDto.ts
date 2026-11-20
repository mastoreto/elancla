import type {
  SimplePageListItemDto,
  SimplePageSnapshot,
} from "@ancla/contracts";
import { type RevisionRow, toRevisionSummaryDto } from "../../../editorial";

interface PageRevisions {
  id: string;
  live: RevisionRow | null;
  working: RevisionRow | null;
  defaultLocale: string;
}

/** The title being edited wins over the published one: it is what the CRM list should show. */
function titleOf({
  working,
  live,
  defaultLocale,
}: PageRevisions): string | null {
  const revision = working ?? live;
  if (!revision) return null;
  const { translations } = revision.snapshot as unknown as SimplePageSnapshot;
  return translations[defaultLocale]?.title ?? null;
}

export function toSimplePageListItemDto(
  page: PageRevisions,
): SimplePageListItemDto {
  const { id, live, working } = page;
  return {
    id,
    title: titleOf(page),
    live: live ? toRevisionSummaryDto(live) : null,
    working: working ? toRevisionSummaryDto(working) : null,
  };
}
