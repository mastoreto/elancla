import type { MinistrySnapshot } from "@ancla/contracts";
import { db } from "@ancla/db";
import { getAuth } from "../../src/core/auth";
import type { createFixtures } from "./fixtures";

type Fixtures = ReturnType<typeof createFixtures>;
type State = "PUBLISHED" | "DRAFT" | "PAUSED";

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

interface LeaderSpec {
  name: string;
  visible: boolean;
  order?: number;
  title?: string;
  bio?: string;
  photoId?: string;
}

interface MinistrySpec {
  /** Slug per language: the languages the profile has. */
  slugs: Record<string, string>;
  state?: State;
  destination?: "PAGE" | "EXTERNAL" | "NONE";
  externalUrl?: string;
  icon?: string;
  color?: string;
  categoryId?: string;
  showOnLanding?: boolean;
  landingOrder?: number;
  landingTile?: "COLOR" | "PHOTO";
  landingTone?: string;
  landingPhotoId?: string;
  coverMediaId?: string;
  socialImageId?: string;
  seo?: { seoTitle?: string; seoDescription?: string };
  leaders?: LeaderSpec[];
}

/**
 * An isolated church (own organization, es + en) with a site key, and a way to create ministries
 * with a chosen editorial state, settings, mosaic position and leaders. The seeded church is
 * never touched, so counts and orderings can be asserted exactly.
 */
export async function createMinistryWorld(fixtures: Fixtures) {
  const organization = await fixtures.createOrganization("ministry-world");
  await db.organization.update({
    where: { id: organization.id },
    data: { locales: ["es", "en"] },
  });
  const { key } = await fixtures.createSiteKey(organization.id);
  const email = await fixtures.passwordUser(getAuth(), "ministry-world");
  const user = await db.user.findUniqueOrThrow({ where: { email } });

  async function createCategory(
    names: Record<string, string>,
    order = 1,
  ): Promise<string> {
    const category = await db.ministryCategory.create({
      data: {
        organizationId: organization.id,
        order,
        translations: {
          create: Object.entries(names).map(([locale, name]) => ({
            locale,
            name,
          })),
        },
      },
    });
    return category.id;
  }

  const mediaIds: string[] = [];
  async function createMedia(status: "ready" | "pending" = "ready") {
    const id = crypto.randomUUID();
    const row = await db.mediaFile.create({
      data: {
        id,
        organizationId: organization.id,
        purpose: "contentImage",
        status,
        key: `${organization.id}/${id}`,
        contentType: "image/png",
        size: 10,
        originalName: "photo.png",
        variants: [
          {
            width: 400,
            height: 300,
            format: "webp",
            key: `${organization.id}/${id}/400.webp`,
            size: 1,
          },
          {
            width: 800,
            height: 600,
            format: "webp",
            key: `${organization.id}/${id}/800.webp`,
            size: 1,
          },
        ],
      },
    });
    mediaIds.push(row.id);
    return row.id;
  }

  let revisionNumber = 0;
  async function createMinistry(spec: MinistrySpec): Promise<string> {
    const [firstSlug] = Object.values(spec.slugs);
    const ministry = await db.ministry.create({
      data: {
        organizationId: organization.id,
        name: `Ministerio ${firstSlug}`,
        slug: `internal-${firstSlug}`,
        destination: spec.destination ?? "PAGE",
        externalUrl: spec.externalUrl ?? null,
        icon: spec.icon ?? null,
        color: spec.color ?? "secondary-700",
        categoryId: spec.categoryId ?? null,
        showOnLanding: spec.showOnLanding ?? false,
        landingOrder: spec.landingOrder ?? 0,
        landingTile: spec.landingTile ?? "COLOR",
        landingTone: spec.landingTone ?? "mist",
        landingPhotoId: spec.landingPhotoId ?? null,
      },
    });
    revisionNumber += 1;
    const snapshot: MinistrySnapshot = {
      translations: Object.fromEntries(
        Object.entries(spec.slugs).map(([locale, slug]) => [
          locale,
          {
            name: `Nombre ${slug}`,
            slug,
            tagline: `Frase ${slug}`,
            about: { type: "doc", content: [paragraph(`Sobre ${slug}`)] },
            values: [],
            ...spec.seo,
          },
        ]),
      ),
      ...(spec.coverMediaId ? { coverMediaId: spec.coverMediaId } : {}),
      ...(spec.socialImageId ? { socialImageId: spec.socialImageId } : {}),
    };
    await db.contentRevision.create({
      data: {
        organizationId: organization.id,
        contentType: "MINISTRY",
        entityId: ministry.id,
        number: revisionNumber,
        state: spec.state ?? "PUBLISHED",
        snapshot: JSON.parse(JSON.stringify(snapshot)),
        authorId: user.id,
        publishedAt: spec.state === "DRAFT" ? null : new Date(),
      },
    });
    for (const leader of spec.leaders ?? []) {
      await db.personProfile.create({
        data: {
          organizationId: organization.id,
          name: leader.name,
          photoId: leader.photoId ?? null,
          translations: leader.bio
            ? { create: [{ locale: "es", bio: leader.bio }] }
            : undefined,
          roles: {
            create: [
              {
                context: "MINISTRY_LEADER",
                ministryId: ministry.id,
                visible: leader.visible,
                order: leader.order ?? 0,
                translations: {
                  create: [{ locale: "es", title: leader.title ?? "Líder" }],
                },
              },
            ],
          },
        },
      });
    }
    return ministry.id;
  }

  return {
    organizationId: organization.id,
    slug: organization.slug,
    key,
    userId: user.id,
    createCategory,
    createMedia,
    createMinistry,
    /** Media has a restrictive FK to the organization: it goes before `fixtures.cleanup()`. */
    async cleanup(): Promise<void> {
      await db.mediaFile.deleteMany({ where: { id: { in: mediaIds } } });
    },
  };
}

export type MinistryWorld = Awaited<ReturnType<typeof createMinistryWorld>>;
