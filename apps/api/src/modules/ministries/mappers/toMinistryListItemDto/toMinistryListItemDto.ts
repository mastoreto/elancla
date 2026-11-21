import type { MinistryListItemDto, MinistrySnapshot } from "@ancla/contracts";
import {
  landingTone as landingToneSchema,
  ministryColor,
  ministryIcon,
} from "@ancla/contracts";
import { type RevisionRow, toRevisionSummaryDto } from "../../../editorial";
import type { MinistryRow } from "../../data";

export interface MinistryRevisions {
  live: RevisionRow | null;
  working: RevisionRow | null;
  defaultLocale: string;
}

/** The name being edited wins over the published one: it is what the CRM list should show. */
function titleOf({
  working,
  live,
  defaultLocale,
}: MinistryRevisions): string | null {
  const revision = working ?? live;
  if (!revision) return null;
  const { translations } = revision.snapshot as unknown as MinistrySnapshot;
  return translations[defaultLocale]?.name ?? null;
}

export function toMinistryListItemDto(
  row: MinistryRow,
  revisions: MinistryRevisions,
): MinistryListItemDto {
  const { live, working } = revisions;
  return {
    id: row.id,
    name: row.name,
    title: titleOf(revisions),
    version: row.version,
    categoryId: row.categoryId,
    destination: toDestination(row.destination),
    externalUrl: row.externalUrl,
    icon: row.icon === null ? null : ministryIcon.parse(row.icon),
    color: ministryColor.parse(row.color),
    showOnLanding: row.showOnLanding,
    landingOrder: row.landingOrder,
    landingTile: row.landingTile === "PHOTO" ? "photo" : "color",
    landingTone: toLandingTone(row.landingTone),
    landingPhotoId: row.landingPhotoId,
    live: live ? toRevisionSummaryDto(live) : null,
    working: working ? toRevisionSummaryDto(working) : null,
  };
}

/** The database enum spelled the way the wire does. */
export function toDestination(
  destination: MinistryRow["destination"],
): MinistryListItemDto["destination"] {
  if (destination === "EXTERNAL") return "external";
  return destination === "NONE" ? "none" : "page";
}

// The stored tone was validated on the way in; parsing again keeps a stray value from leaking out.
export function toLandingTone(
  tone: string,
): MinistryListItemDto["landingTone"] {
  return landingToneSchema.parse(tone);
}
