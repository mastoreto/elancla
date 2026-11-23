import { db } from "@ancla/db";
import { getAuth } from "../../src/core/auth";
import type { createFixtures } from "./fixtures";

type Fixtures = ReturnType<typeof createFixtures>;
type State = "PUBLISHED" | "DRAFT" | "PAUSED";

interface Passage {
  book: string;
  chapter: number;
  verseFrom?: number;
  chapterTo?: number;
  verseTo?: number;
}

export interface SermonSpec {
  slugs: Record<string, string>;
  preachedOn: string;
  videoId: string;
  state?: State;
  featured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
  preacherProfileId?: string;
  passages?: Passage[];
  tags?: string[];
  coverMediaId?: string;
  attachmentMediaIds?: string[];
  summary?: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  viewCount?: number | null;
  platformPublishedAt?: Date | null;
  /** Rich text documents of the base language. */
  withNotes?: boolean;
}

const paragraph = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

/**
 * An isolated church (own organization, es + en) with a site key, a preacher, a series and a way
 * to create sermons with a chosen editorial state and their platform data. The seeded church is
 * never touched, so counts and orderings can be asserted exactly.
 */
export async function createSermonWorld(fixtures: Fixtures) {
  const organization = await fixtures.createOrganization("sermon-world");
  await db.organization.update({
    where: { id: organization.id },
    data: { locales: ["es", "en"] },
  });
  const { key } = await fixtures.createSiteKey(organization.id);
  const email = await fixtures.passwordUser(getAuth(), "sermon-world");
  const user = await db.user.findUniqueOrThrow({ where: { email } });

  const makePreacher = (name: string) =>
    db.personProfile.create({
      data: {
        organizationId: organization.id,
        name,
        roles: { create: [{ context: "PREACHER", visible: true }] },
      },
    });
  const preacher = await makePreacher("Pablo Predicador");
  const secondPreacher = await makePreacher("Ana Anciana");

  const series = await db.sermonSeries.create({
    data: {
      organizationId: organization.id,
      translations: {
        create: [
          {
            locale: "es",
            title: "Hebreos",
            slug: "hebreos",
            description: "Un estudio",
          },
          { locale: "en", title: "Hebrews", slug: "hebrews" },
        ],
      },
    },
  });
  const emptySeries = await db.sermonSeries.create({
    data: {
      organizationId: organization.id,
      order: 1,
      translations: {
        create: [{ locale: "es", title: "Vacía", slug: "vacia" }],
      },
    },
  });

  /** A media file stored as `finalize` leaves it. */
  async function createMedia(
    purpose: "contentImage" | "contentDocument",
    options: {
      status?: "ready" | "pending";
      name?: string;
      size?: number;
    } = {},
  ): Promise<string> {
    const id = crypto.randomUUID();
    const isImage = purpose === "contentImage";
    await db.mediaFile.create({
      data: {
        id,
        organizationId: organization.id,
        purpose,
        status: options.status ?? "ready",
        key: `${organization.id}/${id}`,
        contentType: isImage ? "image/jpeg" : "application/pdf",
        size: options.size ?? 2048,
        originalName: options.name ?? (isImage ? "portada.jpg" : "guia.pdf"),
        variants: isImage
          ? [
              {
                width: 1280,
                height: 720,
                format: "webp",
                key: `${organization.id}/${id}/1280.webp`,
                size: 100,
              },
              {
                width: 640,
                height: 360,
                format: "webp",
                key: `${organization.id}/${id}/640.webp`,
                size: 50,
              },
              {
                width: 1280,
                height: 720,
                format: "avif",
                key: `${organization.id}/${id}/1280.avif`,
                size: 80,
              },
            ]
          : undefined,
      },
    });
    return id;
  }

  let revisionNumber = 0;
  async function createSermon(spec: SermonSpec): Promise<string> {
    const state = spec.state ?? "PUBLISHED";
    const sermon = await db.sermon.create({
      data: {
        organizationId: organization.id,
        firstLiveAt: state === "DRAFT" ? null : new Date(spec.preachedOn),
      },
    });
    await db.platformLink.create({
      data: {
        organizationId: organization.id,
        entityType: "SERMON",
        entityId: sermon.id,
        platform: "YOUTUBE",
        externalId: spec.videoId,
        url: `https://www.youtube.com/watch?v=${spec.videoId}`,
        thumbnailUrl:
          spec.thumbnailUrl === undefined
            ? `https://i.ytimg.com/vi/${spec.videoId}/hqdefault.jpg`
            : spec.thumbnailUrl,
        durationSeconds:
          spec.durationSeconds === undefined ? 3600 : spec.durationSeconds,
        platformPublishedAt:
          spec.platformPublishedAt === undefined
            ? new Date("2026-02-01T12:00:00Z")
            : spec.platformPublishedAt,
        viewCount: spec.viewCount === undefined ? 12345 : spec.viewCount,
      },
    });
    revisionNumber += 1;
    const snapshot = {
      translations: Object.fromEntries(
        Object.entries(spec.slugs).map(([locale, slug]) => [
          locale,
          {
            title: `Título ${slug}`,
            slug,
            summary: spec.summary ?? `Resumen ${slug}`,
            tags: spec.tags ?? [],
            ...(spec.withNotes
              ? {
                  preacherNotes: paragraph(`Notas ${slug}`),
                  outline: paragraph(`Bosquejo ${slug}`),
                }
              : {}),
          },
        ]),
      ),
      ...(spec.preacherProfileId
        ? { preacherProfileId: spec.preacherProfileId }
        : {}),
      ...(spec.seriesId
        ? { seriesId: spec.seriesId, seriesOrder: spec.seriesOrder }
        : {}),
      preachedOn: spec.preachedOn,
      passages: spec.passages ?? [],
      featured: spec.featured ?? false,
      ...(spec.coverMediaId ? { coverMediaId: spec.coverMediaId } : {}),
      attachmentMediaIds: spec.attachmentMediaIds ?? [],
    };
    await db.contentRevision.create({
      data: {
        organizationId: organization.id,
        contentType: "SERMON",
        entityId: sermon.id,
        number: revisionNumber,
        state,
        snapshot,
        authorId: user.id,
        publishedAt: state === "DRAFT" ? null : new Date(),
      },
    });
    return sermon.id;
  }

  return {
    organizationId: organization.id,
    slug: organization.slug,
    key,
    preacherId: preacher.id,
    secondPreacherId: secondPreacher.id,
    seriesId: series.id,
    emptySeriesId: emptySeries.id,
    createSermon,
    createMedia,
  };
}

export type SermonWorld = Awaited<ReturnType<typeof createSermonWorld>>;
