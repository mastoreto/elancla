// Seed data for the first organization. Site values mirror SITE_FALLBACK in
// packages/content/src/site.ts so the public site renders the same after the rework.
import { YOUTUBE_CHANNEL_ID_PATTERN } from "@ancla/contracts";

export const EL_ANCLA_ORGANIZATION = {
  slug: "el-ancla",
  name: "Iglesia Bautista El Ancla",
  country: "UY",
  timezone: "America/Montevideo",
  defaultLocale: "es",
  locales: ["es", "en", "pt"],
  currencies: ["UYU", "USD"],
} as const;

/** Only a well-formed channel id from the environment is stored; anything else leaves it unset. */
function youtubeChannelIdFromEnv(): string | null {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  return channelId && YOUTUBE_CHANNEL_ID_PATTERN.test(channelId)
    ? channelId
    : null;
}

export const EL_ANCLA_SITE_SETTINGS = {
  name: "Iglesia Bautista El Ancla",
  shortName: "El Ancla",
  url: "https://elancla.uy",
  contactEmail: "contacto@elancla.uy",
  addressStreet: "Av. Luis A. de Herrera 3101, esq. Juan Arrieta",
  addressCity: "Montevideo",
  addressRegion: "Montevideo",
  addressCountry: "UY",
  addressPostal: "11600",
  geoLat: -34.872968,
  geoLng: -56.161429,
  themeColor: "#ff2e34",
  founded: "1997",
  youtube: "https://youtube.com/@iglesiaelanclauy",
  instagram: "https://www.instagram.com/iglesiaelancla",
  facebook: "https://www.facebook.com/iglesiabautistaelancla",
  youtubeChannelId: youtubeChannelIdFromEnv(),
} as const;

/** Default meta description per locale; hours and address are composed by the web from the data. */
export const EL_ANCLA_SEO_DESCRIPTIONS = {
  es: "Iglesia Bautista El Ancla en Montevideo: una comunidad cristiana centrada en el evangelio. Reflexiones, ministerios y vida en comunidad.",
  en: "El Ancla Baptist Church in Montevideo: a Christian community centered on the gospel. Reflections, ministries and life together.",
  pt: "Igreja Batista El Ancla em Montevidéu: uma comunidade cristã centrada no evangelho. Reflexões, ministérios e vida em comunidade.",
} as const;
