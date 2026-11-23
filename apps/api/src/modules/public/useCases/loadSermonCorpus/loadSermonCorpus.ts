import type { PublicBlogImageDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { listLiveSnapshots } from "../../../editorial";
import {
  findPreacherNames,
  listSermonLinks,
  listSermonSeriesRows,
} from "../../../sermons";
import { findBlogMedia, findOrganizationLocales } from "../../data";
import {
  buildSermonEntries,
  pickSermonTranslation,
  resolvePublicLocale,
} from "../../domain";
import { byNewestPreached, webpVariantsOf } from "../../mappers";
import type { PublicSermonContext, ServedSermonEntry } from "../../types";

export interface SermonCorpus {
  /** Published sermons in the served language, newest preached first. */
  entries: ServedSermonEntry[];
  ctx: PublicSermonContext;
}

/**
 * Everything the public sermons read, loaded once per request and calculated in memory: the
 * published revisions, their video data, series, preachers and cover images.
 * ponytail: in-memory scan, materialize columns if sermons grow past ~1000.
 */
export async function loadSermonCorpus(input: {
  organizationId: string;
  requestedLocale: string | undefined;
}): Promise<SermonCorpus> {
  const { organizationId, requestedLocale } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const served = { locale, defaultLocale };

  const live = await listLiveSnapshots(organizationId, "SERMON");
  const links = await listSermonLinks(
    organizationId,
    live.map(({ entityId }) => entityId),
  );
  const entries = buildSermonEntries(live, links)
    .flatMap((entry): ServedSermonEntry[] => {
      const picked = pickSermonTranslation(entry.snapshot, served);
      return picked ? [{ ...entry, ...picked }] : [];
    })
    .sort(byNewestPreached);

  const preacherIds = entries.flatMap(
    ({ snapshot }) => snapshot.preacherProfileId ?? [],
  );
  const coverIds = entries.flatMap(
    ({ snapshot }) => snapshot.coverMediaId ?? [],
  );
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const [series, preachers, coverRows] = await Promise.all([
    listSermonSeriesRows(organizationId),
    findPreacherNames(organizationId, [...new Set(preacherIds)]),
    coverIds.length === 0
      ? []
      : findBlogMedia(organizationId, [...new Set(coverIds)]),
  ]);

  const covers = new Map<string, PublicBlogImageDto[]>(
    coverRows.map((row) => [row.id, webpVariantsOf(row, publicBaseUrl)]),
  );
  const ctx: PublicSermonContext = {
    ...served,
    series: new Map(series.map((row) => [row.id, row])),
    preachers: new Map(preachers.map((row) => [row.id, row.name])),
    covers,
    publicBaseUrl,
  };
  return { entries, ctx };
}
