import type { PublicBlogImageDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import {
  buildBlogEntries,
  coverMediaId,
  findOrganizationBlogConfig,
  issueNumbers,
  listPostRows,
  pickBlogTranslation,
} from "../../../blog";
import { listLiveSnapshots } from "../../../editorial";
import {
  findBlogAuthors,
  findBlogCategories,
  findBlogMedia,
  findBlogSeries,
} from "../../data";
import { resolvePublicLocale } from "../../domain";
import { byNewest, toPublicBlogImage } from "../../mappers";
import type { PublicBlogContext, ServedBlogEntry } from "../../types";

/** The ready images among `mediaIds`, by media id. A file that is missing or not ready is absent. */
export async function loadBlogImages(
  organizationId: string,
  mediaIds: readonly string[],
): Promise<Map<string, PublicBlogImageDto>> {
  if (mediaIds.length === 0) return new Map();
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const rows = await findBlogMedia(organizationId, [...new Set(mediaIds)]);
  return new Map(
    rows.flatMap((row) => {
      const image = toPublicBlogImage(row, publicBaseUrl);
      return image ? [[row.id, image] as const] : [];
    }),
  );
}

export interface BlogCorpus {
  /** Published posts (visible and scheduled) in the served language, newest first. */
  entries: ServedBlogEntry[];
  ctx: PublicBlogContext;
  organization: { locales: string[]; defaultLocale: string };
}

/**
 * Everything the public blog reads, loaded once per request and calculated in memory: the
 * published revisions, their taxonomy, authors and cover images.
 * ponytail: in-memory scan, materialize columns if posts grow past ~1000.
 */
export async function loadBlogCorpus(input: {
  organizationId: string;
  requestedLocale: string | undefined;
  now: Date;
}): Promise<BlogCorpus> {
  const { organizationId, requestedLocale, now } = input;
  const organization = await findOrganizationBlogConfig(db, organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales, timezone } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const served = { locale, defaultLocale };

  const [live, posts] = await Promise.all([
    listLiveSnapshots(organizationId, "BLOG_POST"),
    listPostRows(organizationId),
  ]);
  const firstLiveByPost = new Map(
    posts.flatMap(({ id, firstLiveAt }) =>
      firstLiveAt ? [[id, firstLiveAt] as const] : [],
    ),
  );
  const entries = buildBlogEntries(live, firstLiveByPost, now)
    .flatMap((entry): ServedBlogEntry[] => {
      const picked = pickBlogTranslation(entry.snapshot, served);
      return picked ? [{ ...entry, ...picked }] : [];
    })
    .sort(byNewest);

  const visible = entries.filter((entry) => entry.visible);
  const authorIds = [
    ...new Set(entries.map((e) => e.snapshot.authorProfileId)),
  ];
  const coverIds = entries.flatMap((e) => coverMediaId(e.snapshot.cover));
  const [categories, series, authors, images] = await Promise.all([
    findBlogCategories(organizationId),
    findBlogSeries(organizationId),
    findBlogAuthors(organizationId, authorIds, [locale, defaultLocale]),
    loadBlogImages(organizationId, coverIds),
  ]);

  const ctx: PublicBlogContext = {
    ...served,
    timeZone: timezone,
    issues: issueNumbers(
      visible.map(({ postId, firstLiveAt }) => ({ id: postId, firstLiveAt })),
    ),
    categories: new Map(categories.map((row) => [row.id, row])),
    series: new Map(series.map((row) => [row.id, row])),
    authors: new Map(authors.map((row) => [row.id, row])),
    images,
    publicBaseUrl: getStorageEnv().MEDIA_PUBLIC_BASE_URL,
  };
  return { entries, ctx, organization: { locales, defaultLocale } };
}
