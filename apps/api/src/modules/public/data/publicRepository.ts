import { db, type PersonContext } from "@ancla/db";
import { forOrganization } from "../../../core/tenancy";

/**
 * Lookup by key id for the guard. Deliberately not tenant-scoped: nothing is known about the
 * caller yet, and the key (id plus secret) is what identifies its organization.
 */
export function findSiteKeyForAuthentication(id: string) {
  return db.siteApiKey.findUnique({
    where: { id },
    select: {
      secretHash: true,
      revokedAt: true,
      organizationId: true,
      organization: { select: { slug: true } },
    },
  });
}

export function findOrganizationLocales(organizationId: string) {
  return db.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true },
  });
}

/** The settings with the translations of the two languages the response can use. */
export function findSiteSettingsWithTranslations(
  organizationId: string,
  locales: string[],
) {
  return forOrganization(db, organizationId).siteSettings.findFirst({
    include: { translations: { where: { locale: { in: locales } } } },
  });
}

/**
 * The people shown in a context: only roles that are visible, with the texts of the two languages
 * the response can use. Ordering by role `order` is done by the caller (it lives on the role).
 */
export function findVisiblePeopleInContext(input: {
  organizationId: string;
  context: PersonContext;
  locales: string[];
}) {
  const { organizationId, context, locales } = input;
  const role = { context, visible: true };
  return forOrganization(db, organizationId).personProfile.findMany({
    where: { roles: { some: role } },
    include: {
      photo: true,
      translations: { where: { locale: { in: locales } } },
      roles: {
        where: role,
        include: { translations: { where: { locale: { in: locales } } } },
      },
    },
  });
}

export type PublicPersonRow = Awaited<
  ReturnType<typeof findVisiblePeopleInContext>
>[number];

/** The visit page: direction texts and FAQ (in order) in the two languages the response can use. */
export async function findVisitContent(
  organizationId: string,
  locales: string[],
) {
  const tenantDb = forOrganization(db, organizationId);
  const [settings, faqs] = await Promise.all([
    tenantDb.siteSettings.findFirst({
      select: {
        translations: {
          where: { locale: { in: locales } },
          select: {
            locale: true,
            directionsParking: true,
            directionsTransit: true,
            directionsAccessibility: true,
          },
        },
      },
    }),
    tenantDb.visitFaq.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: {
        translations: {
          where: { locale: { in: locales } },
          select: { locale: true, question: true, answer: true },
        },
      },
    }),
  ]);
  return { settings, faqs };
}

export type PublicVisitRows = Awaited<ReturnType<typeof findVisitContent>>;

/** Every category of the organization (deleted ones too: a live post may still name one). */
export function findBlogCategories(organizationId: string) {
  return forOrganization(db, organizationId).category.findMany({
    include: { translations: true },
  });
}

export type PublicBlogCategoryRow = Awaited<
  ReturnType<typeof findBlogCategories>
>[number];

export function findBlogSeries(organizationId: string) {
  return forOrganization(db, organizationId).series.findMany({
    orderBy: { id: "asc" },
    include: { translations: true },
  });
}

export type PublicBlogSeriesRow = Awaited<
  ReturnType<typeof findBlogSeries>
>[number];

/** The profiles named as authors, with their BLOG_AUTHOR role (the card shows only if visible). */
export function findBlogAuthors(
  organizationId: string,
  profileIds: readonly string[],
  locales: string[],
) {
  return forOrganization(db, organizationId).personProfile.findMany({
    where: { id: { in: [...profileIds] } },
    include: {
      photo: true,
      translations: { where: { locale: { in: locales } } },
      roles: {
        where: { context: "BLOG_AUTHOR" },
        include: { translations: { where: { locale: { in: locales } } } },
      },
    },
  });
}

export type PublicBlogAuthorRow = Awaited<
  ReturnType<typeof findBlogAuthors>
>[number];

/** The media files with their stored variants (the caller keeps only the ones that are ready). */
export function findBlogMedia(
  organizationId: string,
  mediaIds: readonly string[],
) {
  return forOrganization(db, organizationId).mediaFile.findMany({
    where: { id: { in: [...mediaIds] } },
    select: { id: true, status: true, variants: true },
  });
}

/** Every ministry of the organization with its category names; the live profile comes from the snapshots. */
export function findPublicMinistries(organizationId: string) {
  return forOrganization(db, organizationId).ministry.findMany({
    include: { category: { include: { translations: true } } },
  });
}

export type PublicMinistryRow = Awaited<
  ReturnType<typeof findPublicMinistries>
>[number];

/** The visible leaders of a ministry with their profile, photo and the texts of the two languages. */
export function findPublicMinistryLeaders(
  organizationId: string,
  ministryId: string,
  locales: string[],
) {
  return forOrganization(db, organizationId).personProfile.findMany({
    where: {
      roles: {
        some: { context: "MINISTRY_LEADER", ministryId, visible: true },
      },
    },
    include: {
      photo: true,
      translations: { where: { locale: { in: locales } } },
      roles: {
        where: { context: "MINISTRY_LEADER", ministryId, visible: true },
        include: { translations: { where: { locale: { in: locales } } } },
      },
    },
  });
}

export type PublicMinistryLeaderRow = Awaited<
  ReturnType<typeof findPublicMinistryLeaders>
>[number];
