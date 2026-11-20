import { blogPostSnapshot } from "@ancla/contracts";
import type { Prisma, PrismaClient } from "../../src";
import { ANCHOR_BODY, seriesBody } from "./elAnclaBlogBodies";

type Texts = Record<string, string>;

const AUTHOR_NAME = "Pr. Juan Olivera";
const AUTHOR_TITLES: Texts = {
  es: "Pastor principal",
  en: "Lead pastor",
  pt: "Pastor principal",
};
const AUTHOR_STATS = {
  es: [
    { label: "Artículos", value: "17" },
    { label: "Años pastor", value: "19" },
    { label: "Series", value: "5" },
    { label: "Cafés", value: "∞" },
  ],
  en: [
    { label: "Articles", value: "17" },
    { label: "Years as pastor", value: "19" },
    { label: "Series", value: "5" },
    { label: "Coffees", value: "∞" },
  ],
  pt: [
    { label: "Artigos", value: "17" },
    { label: "Anos de pastor", value: "19" },
    { label: "Séries", value: "5" },
    { label: "Cafés", value: "∞" },
  ],
};

const CATEGORIES = [
  {
    order: 1,
    names: { es: "Reflexión", en: "Reflection", pt: "Reflexão" },
    slugs: { es: "reflexion", en: "reflection", pt: "reflexao" },
  },
  {
    order: 2,
    names: { es: "Estudio", en: "Study", pt: "Estudo" },
    slugs: { es: "estudio", en: "study", pt: "estudo" },
  },
] as const;

const SERIES = {
  names: { es: "Hebreos", en: "Hebrews", pt: "Hebreus" },
  slugs: { es: "hebreos", en: "hebrews", pt: "hebreus" },
  descriptions: {
    es: "Serie expositiva de la carta a los Hebreos.",
    en: "Expository series on the letter to the Hebrews.",
    pt: "Série expositiva da carta aos Hebreus.",
  },
};

/** Midday in Montevideo (UTC-3), the organization time zone. */
const URL_DATE_HOUR_UTC = 15;
const MS_PER_DAY = 86_400_000;
const SCHEDULED_DAYS_AHEAD = 7;

function entries(texts: Texts): [string, string][] {
  return Object.entries(texts);
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function findAuthorUserId(
  client: PrismaClient,
  organizationId: string,
): Promise<string | null> {
  const user = await client.user.findFirst({
    where: { userRoles: { some: { role: { organizationId } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** The BLOG_AUTHOR role goes on the pastor's existing team profile when there is one. */
async function ensureAuthorProfile(
  client: PrismaClient,
  organizationId: string,
): Promise<string> {
  const roleTranslations = entries(AUTHOR_TITLES).map(([locale, title]) => ({
    locale,
    title,
    stats: AUTHOR_STATS[locale as keyof typeof AUTHOR_STATS],
  }));
  const role = {
    context: "BLOG_AUTHOR" as const,
    visible: true,
    order: 0,
    translations: { create: roleTranslations },
  };
  const existing = await client.personProfile.findFirst({
    where: { organizationId, name: AUTHOR_NAME },
    select: { id: true, roles: { select: { context: true } } },
  });
  if (!existing) {
    const created = await client.personProfile.create({
      data: { organizationId, name: AUTHOR_NAME, roles: { create: role } },
    });
    return created.id;
  }
  const hasRole = existing.roles.some(
    ({ context }) => context === "BLOG_AUTHOR",
  );
  if (!hasRole) {
    await client.personRole.create({
      data: { ...role, personProfileId: existing.id },
    });
  }
  return existing.id;
}

interface SeedPost {
  key: string;
  /** Days before now the post went live; a `scheduled` post goes live a week ahead instead. */
  liveDaysAgo?: number;
  scheduled?: boolean;
  categoryIndex: number;
  seriesOrder?: number;
  featured?: boolean;
  glyph: "anchor" | "book" | "lamp" | "path";
  tint: "paper" | "cream" | "stone" | "sand";
  translations: Record<
    string,
    {
      title: string;
      slug: string;
      excerpt: string;
      tags: string[];
      body: unknown;
    }
  >;
  related: string[];
}

const POSTS: SeedPost[] = [
  {
    key: "anchor",
    liveDaysAgo: 213,
    categoryIndex: 0,
    featured: true,
    glyph: "anchor",
    tint: "paper",
    related: ["hebrews-6", "hebrews-7"],
    translations: {
      es: {
        title: "El ancla del alma: una esperanza que no avergüenza.",
        slug: "el-ancla-del-alma-una-esperanza-que-no-averguenza",
        excerpt:
          "Hebreos 6:19 nos da una imagen poderosa: la esperanza del evangelio es como un ancla del alma, firme y segura.",
        tags: ["Esperanza", "Hebreos", "Reflexión", "Pastoral", "Domingo"],
        body: ANCHOR_BODY.es,
      },
      en: {
        title: "The anchor of the soul: a hope that does not disappoint",
        slug: "the-anchor-of-the-soul-a-hope-that-does-not-disappoint",
        excerpt:
          "Hebrews 6:19 gives us a powerful image: the hope of the gospel is an anchor for the soul, firm and secure.",
        tags: ["Hope", "Hebrews", "Reflection"],
        body: ANCHOR_BODY.en,
      },
      pt: {
        title: "A âncora da alma: uma esperança que não decepciona",
        slug: "a-ancora-da-alma-uma-esperanca-que-nao-decepciona",
        excerpt:
          "Hebreus 6:19 nos dá uma imagem poderosa: a esperança do evangelho é uma âncora da alma, firme e segura.",
        tags: ["Esperança", "Hebreus"],
        body: ANCHOR_BODY.pt,
      },
    },
  },
  {
    key: "hebrews-6",
    liveDaysAgo: 218,
    categoryIndex: 1,
    seriesOrder: 1,
    glyph: "book",
    tint: "stone",
    related: [],
    translations: {
      es: {
        title: "Hebreos 6 - Una esperanza más firme que el ancla.",
        slug: "hebreos-6-una-esperanza-mas-firme-que-el-ancla",
        excerpt:
          "Tercera entrega de la serie expositiva. Notas, citas y preguntas para conversar.",
        tags: ["Hebreos", "Estudio", "Esperanza"],
        body: seriesBody(
          "Tercera entrega de la serie expositiva. Notas, citas y preguntas para conversar.",
          "Estudio",
        ),
      },
    },
  },
  {
    key: "hebrews-7",
    liveDaysAgo: 205,
    categoryIndex: 1,
    seriesOrder: 2,
    glyph: "lamp",
    tint: "sand",
    related: [],
    translations: {
      es: {
        title: "Hebreos 7 - Un sacerdote para siempre.",
        slug: "hebreos-7-un-sacerdote-para-siempre",
        excerpt:
          "Cuarta entrega de la serie expositiva: el sacerdocio de Cristo según Hebreos 7.",
        tags: ["Hebreos", "Estudio"],
        body: seriesBody(
          "Cuarta entrega de la serie expositiva: el sacerdocio de Cristo según Hebreos 7.",
          "Estudio",
        ),
      },
    },
  },
  {
    key: "hebrews-8",
    scheduled: true,
    categoryIndex: 1,
    seriesOrder: 3,
    glyph: "path",
    tint: "cream",
    related: [],
    translations: {
      es: {
        title: "Hebreos 8 - Un mejor pacto.",
        slug: "hebreos-8-un-mejor-pacto",
        excerpt:
          "Quinta entrega de la serie expositiva: el nuevo pacto según Hebreos 8.",
        tags: ["Hebreos", "Estudio"],
        body: seriesBody(
          "Quinta entrega de la serie expositiva: el nuevo pacto según Hebreos 8.",
          "Estudio",
        ),
      },
    },
  },
];

/**
 * Dev data for the blog: 2 categories, the Hebrews series, the pastor as blog author and 4 live
 * posts (one featured, three in the series of which the last is scheduled a week ahead).
 * Idempotent by emptiness: once the organization has any post the seed leaves the blog alone.
 *
 * Revisions are written PUBLISHED directly (what `publish` leaves), so the author is the oldest
 * user holding a role. ponytail: like the simple pages, a brand new database gets the blog the
 * first time the seed runs after the first admin exists.
 */
export async function seedBlog(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const existing = await client.post.count({ where: { organizationId } });
  if (existing > 0) return;

  const revisionAuthorId = await findAuthorUserId(client, organizationId);
  if (!revisionAuthorId) {
    console.info("Blog skipped: no user to author the revisions yet.");
    return;
  }

  const authorProfileId = await ensureAuthorProfile(client, organizationId);

  const categoryIds: string[] = [];
  for (const category of CATEGORIES) {
    const created = await client.category.create({
      data: {
        organizationId,
        order: category.order,
        translations: {
          create: entries(category.names).map(([locale, name]) => ({
            locale,
            name,
            slug: category.slugs[locale as keyof typeof category.slugs],
          })),
        },
      },
    });
    categoryIds.push(created.id);
  }

  const series = await client.series.create({
    data: {
      organizationId,
      translations: {
        create: entries(SERIES.names).map(([locale, name]) => ({
          locale,
          name,
          slug: SERIES.slugs[locale as keyof typeof SERIES.slugs],
          description:
            SERIES.descriptions[locale as keyof typeof SERIES.descriptions],
        })),
      },
    },
  });

  const now = Date.now();
  const postIds = new Map<string, string>();
  const liveDates = new Map<string, Date>();
  for (const seedPost of POSTS) {
    const liveAt = seedPost.scheduled
      ? new Date(now + SCHEDULED_DAYS_AHEAD * MS_PER_DAY)
      : atUrlHour(new Date(now - (seedPost.liveDaysAgo ?? 0) * MS_PER_DAY));
    const post = await client.post.create({
      data: { organizationId, firstLiveAt: liveAt },
    });
    postIds.set(seedPost.key, post.id);
    liveDates.set(seedPost.key, liveAt);
  }

  for (const seedPost of POSTS) {
    const entityId = postIds.get(seedPost.key) as string;
    const firstLiveAt = (
      await client.post.findUniqueOrThrow({ where: { id: entityId } })
    ).firstLiveAt as Date;
    const snapshot = blogPostSnapshot.parse({
      translations: seedPost.translations,
      authorProfileId,
      categoryId: categoryIds[seedPost.categoryIndex],
      ...(seedPost.seriesOrder === undefined
        ? {}
        : { seriesId: series.id, seriesOrder: seedPost.seriesOrder }),
      featured: seedPost.featured ?? false,
      relatedPostIds: seedPost.related.map((key) => postIds.get(key) as string),
      cover: { kind: "design", glyph: seedPost.glyph, tint: seedPost.tint },
      writtenAt: firstLiveAt.toISOString().slice(0, 10),
      ...(seedPost.scheduled ? { publishAt: firstLiveAt.toISOString() } : {}),
    });
    await client.contentRevision.create({
      data: {
        organizationId,
        contentType: "BLOG_POST",
        entityId,
        number: 1,
        state: "PUBLISHED",
        snapshot: toJson(snapshot),
        authorId: revisionAuthorId,
        publishedAt: new Date(),
      },
    });
  }
}

function atUrlHour(date: Date): Date {
  const day = new Date(date);
  day.setUTCHours(URL_DATE_HOUR_UTC, 0, 0, 0);
  return day;
}
