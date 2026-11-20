import { db } from "@ancla/db";
import { getAuth } from "../../src/core/auth";
import { urlDate } from "../../src/modules/blog";
import type { createFixtures } from "./fixtures";

const DAY_MS = 24 * 60 * 60 * 1000;

type Fixtures = ReturnType<typeof createFixtures>;
type State = "PUBLISHED" | "DRAFT" | "PAUSED";

interface PostSpec {
  slugs: Record<string, string>;
  categoryId: string;
  seriesId?: string;
  seriesOrder?: number;
  featured?: boolean;
  relatedPostIds?: string[];
  tags?: string[];
  firstLiveAt: Date | null;
  publishAt?: string;
  state?: State;
  body?: unknown;
  cover?: unknown;
}

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});
const heading = (text: string) => ({
  type: "heading",
  attrs: { level: 2 },
  content: [{ type: "text", text }],
});
export const blogBody = (...blocks: unknown[]) => ({
  type: "doc",
  content: blocks.length > 0 ? blocks : [paragraph("Texto del artículo")],
});
export { heading, paragraph };

/**
 * An isolated church (own organization, es + en, Montevideo time) with a site key, a blog author,
 * two categories and one series, and a way to create posts with a chosen editorial state. The
 * seeded church is never touched, so counts and orderings can be asserted exactly.
 */
export async function createBlogWorld(fixtures: Fixtures) {
  const organization = await fixtures.createOrganization("blog-world");
  await db.organization.update({
    where: { id: organization.id },
    data: { locales: ["es", "en"] },
  });
  const { key } = await fixtures.createSiteKey(organization.id);
  const email = await fixtures.passwordUser(getAuth(), "blog-world");
  const user = await db.user.findUniqueOrThrow({ where: { email } });

  const author = await db.personProfile.create({
    data: {
      organizationId: organization.id,
      name: "Ana Autora",
      translations: { create: [{ locale: "es", bio: "Bio de Ana" }] },
      roles: {
        create: [
          {
            context: "BLOG_AUTHOR",
            visible: true,
            translations: {
              create: [
                {
                  locale: "es",
                  title: "Pastora",
                  stats: [{ label: "Artículos", value: "12" }],
                },
              ],
            },
          },
        ],
      },
    },
  });

  const makeCategory = (
    order: number,
    names: Record<string, [string, string]>,
  ) =>
    db.category.create({
      data: {
        organizationId: organization.id,
        order,
        translations: {
          create: Object.entries(names).map(([locale, [name, slug]]) => ({
            locale,
            name,
            slug,
          })),
        },
      },
    });
  const categoryA = await makeCategory(1, {
    es: ["Reflexión", "reflexion"],
    en: ["Reflection", "reflection"],
  });
  const categoryB = await makeCategory(2, { es: ["Estudio", "estudio"] });
  const series = await db.series.create({
    data: {
      organizationId: organization.id,
      translations: {
        create: [{ locale: "es", name: "Hebreos", slug: "hebreos" }],
      },
    },
  });

  let revisionNumber = 0;
  async function createPost(spec: PostSpec): Promise<string> {
    const post = await db.post.create({
      data: { organizationId: organization.id, firstLiveAt: spec.firstLiveAt },
    });
    revisionNumber += 1;
    const snapshot = {
      translations: Object.fromEntries(
        Object.entries(spec.slugs).map(([locale, slug]) => [
          locale,
          {
            title: `Título ${slug}`,
            slug,
            excerpt: `Extracto ${slug}`,
            body: spec.body ?? blogBody(),
            tags: spec.tags ?? [],
          },
        ]),
      ),
      authorProfileId: author.id,
      categoryId: spec.categoryId,
      ...(spec.seriesId
        ? { seriesId: spec.seriesId, seriesOrder: spec.seriesOrder }
        : {}),
      featured: spec.featured ?? false,
      relatedPostIds: spec.relatedPostIds ?? [],
      cover: spec.cover ?? { kind: "design", glyph: "anchor", tint: "paper" },
      writtenAt: "2026-01-15",
      ...(spec.publishAt ? { publishAt: spec.publishAt } : {}),
    };
    await db.contentRevision.create({
      data: {
        organizationId: organization.id,
        contentType: "BLOG_POST",
        entityId: post.id,
        number: revisionNumber,
        state: spec.state ?? "PUBLISHED",
        snapshot,
        authorId: user.id,
        publishedAt: spec.state === "DRAFT" ? null : new Date(),
      },
    });
    return post.id;
  }

  /** Today in the organization's zone (`YYYY-MM-DD`) and as the `@db.Date` value. */
  const today = (): { day: string; date: Date } => {
    const day = urlDate(new Date(), "America/Montevideo");
    return { day, date: new Date(`${day}T00:00:00Z`) };
  };

  return {
    organizationId: organization.id,
    slug: organization.slug,
    key,
    authorId: author.id,
    categoryA: categoryA.id,
    categoryB: categoryB.id,
    seriesId: series.id,
    createPost,
    today,
    daysFromNow: (days: number): Date => new Date(Date.now() + days * DAY_MS),
  };
}

export type BlogWorld = Awaited<ReturnType<typeof createBlogWorld>>;
