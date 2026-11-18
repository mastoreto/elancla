// Seed data for the first organization. Site values mirror SITE_FALLBACK in
// packages/content/src/site.ts so the public site renders the same after the rework.

export const EL_ANCLA_ORGANIZATION = {
  slug: "el-ancla",
  name: "Iglesia Bautista El Ancla",
  country: "UY",
  timezone: "America/Montevideo",
  defaultLocale: "es",
  locales: ["es", "en", "pt"],
  currencies: ["UYU", "USD"],
} as const;

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
  serviceTimesSummary: "Su 11:15-13:00",
  youtube: "https://youtube.com/@iglesiaelanclauy",
  instagram: "https://www.instagram.com/iglesiaelancla",
  facebook: "https://www.facebook.com/iglesiabautistaelancla",
} as const;
