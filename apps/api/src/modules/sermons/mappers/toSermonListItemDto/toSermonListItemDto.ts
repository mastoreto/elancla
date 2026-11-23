import type { SermonListItemDto, SermonSnapshot } from "@ancla/contracts";
import { type RevisionRow, toRevisionSummaryDto } from "../../../editorial";
import type { PlatformLinkRow } from "../../data";
import { toPlatformLinkDto } from "../toPlatformLinkDto";

interface SermonListInput {
  id: string;
  defaultLocale: string;
  live: RevisionRow | null;
  working: RevisionRow | null;
  /** Names by id. */
  preacherNames: ReadonlyMap<string, string>;
  /** Titles by id, already resolved to the organization's default language. */
  seriesTitles: ReadonlyMap<string, string>;
  link: PlatformLinkRow | undefined;
}

/** The revision being edited wins over the published one: it is what the CRM list should show. */
export function toSermonListItemDto({
  id,
  defaultLocale,
  live,
  working,
  preacherNames,
  seriesTitles,
  link,
}: SermonListInput): SermonListItemDto {
  const current = working ?? live;
  const snapshot = current?.snapshot as unknown as SermonSnapshot | undefined;
  const preacherName =
    snapshot?.preacherProfileId === undefined
      ? undefined
      : preacherNames.get(snapshot.preacherProfileId);
  const seriesTitle =
    snapshot?.seriesId === undefined
      ? undefined
      : seriesTitles.get(snapshot.seriesId);
  return {
    id,
    title: snapshot?.translations[defaultLocale]?.title ?? null,
    preachedOn: snapshot?.preachedOn ?? null,
    preacher:
      snapshot?.preacherProfileId !== undefined && preacherName !== undefined
        ? { id: snapshot.preacherProfileId, name: preacherName }
        : null,
    series:
      snapshot?.seriesId !== undefined && seriesTitle !== undefined
        ? { id: snapshot.seriesId, title: seriesTitle }
        : null,
    live: live ? toRevisionSummaryDto(live) : null,
    working: working ? toRevisionSummaryDto(working) : null,
    platform: link ? toPlatformLinkDto(link) : null,
  };
}
