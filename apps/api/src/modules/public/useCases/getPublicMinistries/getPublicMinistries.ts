import type { MinistrySnapshot, PublicMinistriesDto } from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import { listLiveSnapshots } from "../../../editorial";
import { findOrganizationLocales, findPublicMinistries } from "../../data";
import { pickMinistryTranslation, resolvePublicLocale } from "../../domain";
import { toPublicMinistriesDto } from "../../mappers";
import type { ServedMinistry } from "../../types";
import { loadBlogImages } from "../loadBlogCorpus";

/**
 * The ministries whose profile is published (a draft or paused one is hidden) and the ordered
 * landing mosaic. ponytail: in-memory scan, fine for dozens of ministries.
 */
export async function getPublicMinistries(input: {
  organizationId: string;
  requestedLocale: string | undefined;
}): Promise<PublicMinistriesDto> {
  const { organizationId, requestedLocale } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const [live, rows] = await Promise.all([
    listLiveSnapshots(organizationId, "MINISTRY"),
    findPublicMinistries(organizationId),
  ]);
  const snapshots = new Map(live.map((item) => [item.entityId, item.snapshot]));
  const served = rows.flatMap((row): ServedMinistry[] => {
    const snapshot = snapshots.get(row.id);
    const picked = snapshot
      ? pickMinistryTranslation(snapshot, { locale, defaultLocale })
      : null;
    return snapshot && picked
      ? [{ row, snapshot: snapshot as unknown as MinistrySnapshot, ...picked }]
      : [];
  });
  const images = await loadBlogImages(
    organizationId,
    served.flatMap(({ row }) =>
      row.landingTile === "PHOTO" && row.landingPhotoId
        ? [row.landingPhotoId]
        : [],
    ),
  );
  return toPublicMinistriesDto(served, { locale, defaultLocale, images });
}
