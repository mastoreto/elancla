import type { SermonListDto, SermonSnapshot } from "@ancla/contracts";
import { db } from "@ancla/db";
import { listCurrentRevisionRows, type RevisionRow } from "../../../editorial";
import {
  findOrganizationSermonConfig,
  findPreacherNames,
  findSeriesTitles,
  listSermonLinks,
  listSermonRows,
} from "../../data";
import { toSermonListItemDto } from "../../mappers";

const LIVE_STATES = ["PUBLISHED", "PAUSED"];

const snapshotOf = (row: RevisionRow): SermonSnapshot =>
  row.snapshot as unknown as SermonSnapshot;

function titleInLocale(
  translations: { locale: string; title: string }[],
  locale: string,
): string {
  return (
    (translations.find((entry) => entry.locale === locale) ?? translations[0])
      ?.title ?? ""
  );
}

function groupByEntity(revisions: RevisionRow[]): Map<string, RevisionRow[]> {
  const byEntity = new Map<string, RevisionRow[]>();
  for (const revision of revisions) {
    byEntity.set(revision.entityId, [
      ...(byEntity.get(revision.entityId) ?? []),
      revision,
    ]);
  }
  return byEntity;
}

/** Latest preached first; a sermon with no content yet goes last, newest created first among them. */
const byPreachedOnDescending = (
  a: { preachedOn: string | null },
  b: { preachedOn: string | null },
): number => (b.preachedOn ?? "").localeCompare(a.preachedOn ?? "");

/**
 * Every sermon with its live and working revision, its preacher and series names and what its
 * platform says (views included), in a fixed number of queries whatever the count.
 */
export async function listSermons(
  organizationId: string,
): Promise<SermonListDto> {
  const config = await findOrganizationSermonConfig(db, organizationId);
  const defaultLocale = config?.defaultLocale ?? "";
  const [sermons, revisions] = await Promise.all([
    listSermonRows(organizationId),
    listCurrentRevisionRows(organizationId, "SERMON"),
  ]);
  const snapshots = revisions.map(snapshotOf);
  const [series, preachers, links] = await Promise.all([
    findSeriesTitles(organizationId, [
      ...new Set(snapshots.flatMap(({ seriesId }) => seriesId ?? [])),
    ]),
    findPreacherNames(organizationId, [
      ...new Set(
        snapshots.flatMap(({ preacherProfileId }) => preacherProfileId ?? []),
      ),
    ]),
    listSermonLinks(
      organizationId,
      sermons.map(({ id }) => id),
    ),
  ]);
  const seriesTitles = new Map(
    series.map(({ id, translations }) => [
      id,
      titleInLocale(translations, defaultLocale),
    ]),
  );
  const preacherNames = new Map(preachers.map(({ id, name }) => [id, name]));
  const byEntity = groupByEntity(revisions);

  const items = sermons.map(({ id }) => {
    const own = byEntity.get(id) ?? [];
    return toSermonListItemDto({
      id,
      defaultLocale,
      live: own.find((row) => LIVE_STATES.includes(row.state)) ?? null,
      working: own.find((row) => !LIVE_STATES.includes(row.state)) ?? null,
      preacherNames,
      seriesTitles,
      link: links.get(id),
    });
  });
  return { items: items.sort(byPreachedOnDescending) };
}
