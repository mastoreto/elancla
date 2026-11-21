import {
  ministryColor,
  ministryIcon,
  type PublicBlogImageDto,
  type PublicLandingEntryDto,
  type PublicMinistriesDto,
  type PublicMinistrySummaryDto,
} from "@ancla/contracts";
import {
  resolveMinistryHref,
  sortLanding,
  toDestination,
  toLandingTone,
} from "../../../ministries";
import { pickLocalizedValue, type ServedLocales } from "../../domain";
import type { ServedMinistry } from "../../types";

interface MinistriesContext extends ServedLocales {
  /** Ready images by media id; a photo that is absent is not shown. */
  images: ReadonlyMap<string, PublicBlogImageDto>;
}

const hasPage = ({ row }: ServedMinistry): boolean =>
  row.destination === "PAGE";

function hrefOf(
  served: ServedMinistry,
  { locale, defaultLocale }: ServedLocales,
): string | undefined {
  const { row, translation } = served;
  return resolveMinistryHref({
    destination: toDestination(row.destination),
    slug: hasPage(served) ? translation.slug : undefined,
    externalUrl: row.externalUrl,
    locale,
    defaultLocale,
  });
}

function categoryOf(
  { row }: ServedMinistry,
  locales: ServedLocales,
): string | undefined {
  if (!row.category || row.category.deletedAt) return undefined;
  return (
    pickLocalizedValue(row.category.translations, locales, (t) => t.name) ??
    undefined
  );
}

function toSummary(
  served: ServedMinistry,
  locales: ServedLocales,
): PublicMinistrySummaryDto {
  const { row, translation } = served;
  const href = hrefOf(served, locales);
  const category = categoryOf(served, locales);
  const icon = ministryIcon.safeParse(row.icon);
  return {
    name: translation.name,
    ...(hasPage(served) ? { slug: translation.slug } : {}),
    ...(href ? { href } : {}),
    tagline: translation.tagline,
    ...(icon.success ? { icon: icon.data } : {}),
    color: ministryColor.parse(row.color),
    ...(category ? { category } : {}),
  };
}

/** A photo tile whose image is missing or not ready shows its color instead. */
function toLandingEntry(
  served: ServedMinistry,
  { images, ...locales }: MinistriesContext,
): PublicLandingEntryDto {
  const { row, translation } = served;
  const href = hrefOf(served, locales);
  const photo = row.landingPhotoId ? images.get(row.landingPhotoId) : undefined;
  const tone = toLandingTone(row.landingTone);
  return {
    name: translation.name,
    ...(href ? { href } : {}),
    tile:
      row.landingTile === "PHOTO" && photo
        ? { kind: "photo", image: photo }
        : { kind: "color", tone },
  };
}

/** Explicit field list: no id (ministry, category, media) leaves through the public API. */
export function toPublicMinistriesDto(
  served: readonly ServedMinistry[],
  context: MinistriesContext,
): PublicMinistriesDto {
  const sorted = sortLanding(
    served.map((entry) => ({
      entry,
      name: entry.translation.name,
      showOnLanding: entry.row.showOnLanding,
      landingOrder: entry.row.landingOrder,
    })),
    context.locale,
  ).map(({ entry }) => entry);
  return {
    ministries: sorted.map((entry) => toSummary(entry, context)),
    landing: sorted
      .filter(({ row }) => row.showOnLanding)
      .map((entry) => toLandingEntry(entry, context)),
  };
}
