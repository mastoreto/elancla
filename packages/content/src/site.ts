// @ancla/content/site — configuración del sitio para el ancla (lectura build-time).
// getSiteConfig() lee de @ancla/db al compilar; si no hay BD/cliente/registro cae
// a SITE_FALLBACK (los valores históricos de seo.ts) para que el build estático
// nunca rompa. iEkklesia (admin) escribe; el ancla lee.

export type SiteLocale = "es" | "pt" | "en";
export type SiteStatus = "online" | "maintenance" | "closed";

export interface SiteSocial {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
  website?: string;
}

export interface SiteConfig {
  url: string;
  name: string;
  shortName: string;
  locale: string;
  lang: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultImage: string;
  themeColor: string;
  twitter: string;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  geo: { latitude: number; longitude: number };
  contactEmail: string;
  founded: string;
  serviceTimes: string;
  status: SiteStatus;
  social: SiteSocial;
}

export interface ServiceTimeItem {
  label: string;
  time: string;
  description?: string;
}

export interface SiteContent {
  aboutRichText: unknown | null;
  schedule: ServiceTimeItem[];
}

// Valores por defecto (copia de los valores históricos de apps/web/src/utils/seo.ts).
export const SITE_FALLBACK: SiteConfig = {
  url: "https://elancla.uy",
  name: "Iglesia Bautista El Ancla",
  shortName: "El Ancla",
  locale: "es_UY",
  lang: "es-UY",
  defaultTitle: "Iglesia Bautista El Ancla",
  titleTemplate: "%s | Iglesia Bautista El Ancla",
  defaultDescription:
    "Iglesia Bautista El Ancla en Montevideo: una comunidad cristiana centrada en el evangelio. Reflexiones, ministerios y vida en comunidad. Domingos 11:15 hs.",
  defaultImage: "/images/homebanner.jpeg",
  themeColor: "#ff2e34",
  twitter: "@iglesiaelancla",
  address: {
    street: "Av. Luis A. de Herrera 3101, esq. Juan Arrieta",
    city: "Montevideo",
    region: "Montevideo",
    country: "UY",
    postalCode: "11600",
  },
  geo: { latitude: -34.872968, longitude: -56.161429 },
  contactEmail: "contacto@elancla.uy",
  founded: "1997",
  serviceTimes: "Su 11:15-12:30",
  status: "online",
  social: {
    youtube: "https://youtube.com/@iglesiaelanclauy",
    instagram: "https://www.instagram.com/iglesiaelancla",
    facebook: "https://www.facebook.com/iglesiabautistaelancla",
  },
};

const STATUS_MAP: Record<string, SiteStatus> = {
  ONLINE: "online",
  MAINTENANCE: "maintenance",
  CLOSED: "closed",
};

const LOCALE_ENUM: Record<SiteLocale, "ES" | "PT" | "EN"> = {
  es: "ES",
  pt: "PT",
  en: "EN",
};

/** Carga perezosa del cliente Prisma (puede no existir hasta `db:generate`). */
async function loadDb() {
  try {
    const { db } = await import("@ancla/db");
    return db;
  } catch {
    return null;
  }
}

/**
 * Configuración del sitio fusionada sobre SITE_FALLBACK. Los campos no presentes
 * en la BD (lang, plantillas de título, handle de twitter, imagen por defecto)
 * conservan el valor por defecto.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const db = await loadDb();
    if (!db) return SITE_FALLBACK;

    const s = await db.siteSettings.findFirst();
    if (!s) return SITE_FALLBACK;

    return {
      ...SITE_FALLBACK,
      url: s.url || SITE_FALLBACK.url,
      name: s.name || SITE_FALLBACK.name,
      shortName: s.shortName ?? SITE_FALLBACK.shortName,
      themeColor: s.themeColor ?? SITE_FALLBACK.themeColor,
      contactEmail: s.contactEmail ?? SITE_FALLBACK.contactEmail,
      founded: s.founded ?? SITE_FALLBACK.founded,
      serviceTimes: s.serviceTimesSummary ?? SITE_FALLBACK.serviceTimes,
      status: STATUS_MAP[s.status] ?? SITE_FALLBACK.status,
      address: {
        street: s.addressStreet ?? SITE_FALLBACK.address.street,
        city: s.addressCity ?? SITE_FALLBACK.address.city,
        region: s.addressRegion ?? SITE_FALLBACK.address.region,
        country: s.addressCountry ?? SITE_FALLBACK.address.country,
        postalCode: s.addressPostal ?? SITE_FALLBACK.address.postalCode,
      },
      geo: {
        latitude: s.geoLat ?? SITE_FALLBACK.geo.latitude,
        longitude: s.geoLng ?? SITE_FALLBACK.geo.longitude,
      },
      social: {
        youtube: s.youtube ?? SITE_FALLBACK.social.youtube,
        instagram: s.instagram ?? SITE_FALLBACK.social.instagram,
        facebook: s.facebook ?? SITE_FALLBACK.social.facebook,
        twitter: s.twitter ?? SITE_FALLBACK.social.twitter,
        spotify: s.spotify ?? SITE_FALLBACK.social.spotify,
        linkedin: s.linkedin ?? SITE_FALLBACK.social.linkedin,
        website: s.website ?? SITE_FALLBACK.social.website,
      },
    };
  } catch {
    return SITE_FALLBACK;
  }
}

/**
 * Contenido localizado del sitio (sección «nosotros» + schedule del hero).
 * Devuelve null/[] si no hay BD o registro para el locale; los consumidores
 * deben mantener su contenido i18n actual como fallback.
 */
export async function getSiteContent(locale: SiteLocale): Promise<SiteContent> {
  const empty: SiteContent = { aboutRichText: null, schedule: [] };
  try {
    const db = await loadDb();
    if (!db) return empty;

    const localeEnum = LOCALE_ENUM[locale];
    const [translation, serviceTimes] = await Promise.all([
      db.siteSettingsTranslation.findFirst({ where: { locale: localeEnum } }),
      db.serviceTime.findMany({
        where: { locale: localeEnum },
        orderBy: { order: "asc" },
      }),
    ]);

    return {
      aboutRichText: translation?.aboutRichText ?? null,
      schedule: serviceTimes.map((t) => ({
        label: t.label,
        time: t.time,
        description: t.description ?? undefined,
      })),
    };
  } catch {
    return empty;
  }
}
