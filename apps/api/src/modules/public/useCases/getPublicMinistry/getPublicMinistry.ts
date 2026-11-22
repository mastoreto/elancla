import type { MinistrySnapshot, PublicMinistryDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { getMinistrySchedule } from "../../../calendar";
import { listLiveSnapshots } from "../../../editorial";
import {
  findOrganizationLocales,
  findPublicMinistries,
  findPublicMinistryLeaders,
} from "../../data";
import { pickMinistryTranslation, resolvePublicLocale } from "../../domain";
import { toPublicMinistryDto } from "../../mappers";
import { loadBlogImages } from "../loadBlogCorpus";

const hasSlug = (snapshot: MinistrySnapshot, slug: string): boolean =>
  Object.values(snapshot.translations).some(
    (translation) => translation.slug === slug,
  );

/**
 * A published ministry by the slug it has in any of its languages, served in the requested one
 * (or the default). A draft, a paused profile, a ministry without a page of its own and an unknown
 * slug are the same 404.
 */
export async function getPublicMinistry(input: {
  organizationId: string;
  slug: string;
  requestedLocale: string | undefined;
  now?: Date;
}): Promise<PublicMinistryDto> {
  const { organizationId, slug, requestedLocale, now = new Date() } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const served = { locale, defaultLocale };

  const [live, rows] = await Promise.all([
    listLiveSnapshots(organizationId, "MINISTRY"),
    findPublicMinistries(organizationId),
  ]);
  // ponytail: in-memory scan, fine for dozens of ministries.
  const found = live.find((item) =>
    hasSlug(item.snapshot as unknown as MinistrySnapshot, slug),
  );
  const row = rows.find((candidate) => candidate.id === found?.entityId);
  const picked = found ? pickMinistryTranslation(found.snapshot, served) : null;
  if (!found || !row || !picked || row.destination !== "PAGE") {
    throw new NotFoundError("The ministry was not found");
  }
  const snapshot = found.snapshot as unknown as MinistrySnapshot;

  const [leaders, schedule, images] = await Promise.all([
    findPublicMinistryLeaders(organizationId, row.id, [locale, defaultLocale]),
    getMinistrySchedule(organizationId, row.id, now),
    loadBlogImages(
      organizationId,
      [snapshot.coverMediaId, snapshot.socialImageId].filter(
        (id): id is string => id !== undefined,
      ),
    ),
  ]);
  return toPublicMinistryDto({ row, snapshot, ...picked }, leaders, {
    ...served,
    schedule,
    images,
    publicBaseUrl: getStorageEnv().MEDIA_PUBLIC_BASE_URL,
  });
}
