import {
  ministryColor,
  ministryIcon,
  type PublicBlogImageDto,
  type PublicMinistryDto,
  type PublicMinistryLeaderDto,
  type PublicMinistryScheduleSlotDto,
  richTextDocSchema,
} from "@ancla/contracts";
import { resolveSeo } from "../../../ministries";
import type { PublicMinistryLeaderRow } from "../../data";
import { pickLocalizedValue, type ServedLocales } from "../../domain";
import type { ServedMinistry } from "../../types";
import { webpVariantsOf } from "../toPublicBlogImages";

interface MinistryContext extends ServedLocales {
  schedule: PublicMinistryScheduleSlotDto[];
  images: ReadonlyMap<string, PublicBlogImageDto>;
  publicBaseUrl: string;
}

/** Explicit field list: no id, user or timestamp of the person leaves through the public API. */
export function toPublicLeaderDto(
  row: PublicMinistryLeaderRow,
  locales: ServedLocales,
  publicBaseUrl: string,
): PublicMinistryLeaderDto {
  const [role] = row.roles;
  const photo = webpVariantsOf(row.photo, publicBaseUrl);
  const bio = pickLocalizedValue(row.translations, locales, (t) => t.bio);
  return {
    name: row.name,
    title: role
      ? (pickLocalizedValue(role.translations, locales, (t) => t.title) ?? "")
      : "",
    ...(photo.length > 0 ? { photo } : {}),
    ...(bio ? { bio } : {}),
  };
}

const orderOf = (row: PublicMinistryLeaderRow): number =>
  row.roles[0]?.order ?? 0;

/** The detail of a ministry; `alternates` lists the slug of every language, for `hreflang`. */
export function toPublicMinistryDto(
  { row, snapshot, locale, translation }: ServedMinistry,
  leaders: readonly PublicMinistryLeaderRow[],
  context: MinistryContext,
): PublicMinistryDto {
  const { images, publicBaseUrl, schedule, ...locales } = context;
  const imageOf = (id: string | undefined) =>
    id === undefined ? undefined : images.get(id);
  const cover = imageOf(snapshot.coverMediaId);
  const icon = ministryIcon.safeParse(row.icon);
  return {
    locale,
    name: translation.name,
    slug: translation.slug,
    tagline: translation.tagline,
    // Parsed again on the way out: the stored JSON is never trusted blindly.
    about: richTextDocSchema.parse(translation.about),
    values: translation.values.map(({ title, description }) => ({
      title,
      description,
    })),
    ...(translation.place ? { place: translation.place } : {}),
    ...(translation.audience ? { audience: translation.audience } : {}),
    ...(translation.howToJoin ? { howToJoin: translation.howToJoin } : {}),
    ...(translation.nextStep ? { nextStep: translation.nextStep } : {}),
    ...(icon.success ? { icon: icon.data } : {}),
    color: ministryColor.parse(row.color),
    leaders: [...leaders]
      .sort((a, b) => orderOf(a) - orderOf(b) || a.name.localeCompare(b.name))
      .map((leader) => toPublicLeaderDto(leader, locales, publicBaseUrl)),
    schedule,
    ...(cover
      ? {
          cover: {
            ...(translation.coverAlt ? { alt: translation.coverAlt } : {}),
            image: cover,
          },
        }
      : {}),
    seo: stripUndefined(
      resolveSeo(translation, {
        social: imageOf(snapshot.socialImageId),
        cover,
      }),
    ),
    alternates: Object.fromEntries(
      Object.entries(snapshot.translations).map(([key, value]) => [
        key,
        value.slug,
      ]),
    ),
  };
}

function stripUndefined<Value extends object>(value: Value): Value {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Value;
}
