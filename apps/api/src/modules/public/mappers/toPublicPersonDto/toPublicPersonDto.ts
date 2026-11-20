import { type PublicPersonDto, personStatsDto } from "@ancla/contracts";
import { buildMediaVariantUrls } from "../../../media";
import { initials } from "../../../people";
import type { PublicPersonRow } from "../../data";

interface PublicPersonLocales {
  locale: string;
  defaultLocale: string;
}

/** The text in the requested language, or in the default one when it has none. */
function withFallback<Row extends { locale: string }, Value>(
  rows: Row[],
  { locale, defaultLocale }: PublicPersonLocales,
  read: (row: Row) => Value | null,
): Value | null {
  const own = rows.find((row) => row.locale === locale);
  const ownValue = own ? read(own) : null;
  if (ownValue !== null) return ownValue;
  const fallback = rows.find((row) => row.locale === defaultLocale);
  return fallback ? read(fallback) : null;
}

// ponytail: only webp is exposed; every browser the site supports reads it, and avif adds a second
// list the web would have to choose from.
function photoOf(
  row: PublicPersonRow,
  publicBaseUrl: string,
): PublicPersonDto["photo"] {
  if (!row.photo || row.photo.status !== "ready") return null;
  const variants = buildMediaVariantUrls(row.photo.variants, publicBaseUrl)
    .filter((variant) => variant.format === "webp")
    .map(({ url, width, height }) => ({ url, width, height }));
  return variants.length > 0 ? variants : null;
}

/** Explicit field list: no id, user or timestamp leaves through the public API. */
export function toPublicPersonDto(
  row: PublicPersonRow,
  locales: PublicPersonLocales,
  publicBaseUrl: string,
): PublicPersonDto {
  const [role] = row.roles;
  return {
    name: row.name,
    initials: initials(row.name),
    photo: photoOf(row, publicBaseUrl),
    bio: withFallback(row.translations, locales, (t) => t.bio),
    title: role
      ? withFallback(role.translations, locales, (t) => t.title)
      : null,
    stats: role
      ? personStatsDto.parse(
          withFallback(role.translations, locales, (t) => t.stats) ?? [],
        )
      : [],
  };
}
