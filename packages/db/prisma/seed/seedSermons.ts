import { sermonSnapshot } from "@ancla/contracts";
import type { PrismaClient } from "../../src";
import {
  SEED_OUTLINE,
  SEED_PREACHER_NAMES,
  SEED_SERIES,
  SEED_SERMONS,
  type SeedSermon,
} from "./elAnclaSermons";
import { EL_ANCLA_TEAM } from "./elAnclaTeam";
import { findAuthorUserId, toJson } from "./seedHelpers";

const URL_DATE_HOUR_UTC = 15;
const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=";
const YOUTUBE_THUMBNAIL_URL = "https://i.ytimg.com/vi";

function entries(texts: Record<string, string>): [string, string][] {
  return Object.entries(texts);
}

function titlesOfTeamMember(name: string): Record<string, string> {
  const member = EL_ANCLA_TEAM.find((candidate) => candidate.name === name);
  return member?.title ?? { es: "Predicador" };
}

/** The PREACHER role goes on the existing team profile when there is one. */
async function ensurePreacherProfile(
  client: PrismaClient,
  organizationId: string,
  name: string,
  order: number,
): Promise<string> {
  const role = {
    context: "PREACHER" as const,
    visible: true,
    order,
    translations: {
      create: entries(titlesOfTeamMember(name)).map(([locale, title]) => ({
        locale,
        title,
      })),
    },
  };
  const existing = await client.personProfile.findFirst({
    where: { organizationId, name },
    select: { id: true, roles: { select: { context: true } } },
  });
  if (!existing) {
    const created = await client.personProfile.create({
      data: { organizationId, name, roles: { create: role } },
    });
    return created.id;
  }
  if (!existing.roles.some(({ context }) => context === "PREACHER")) {
    await client.personRole.create({
      data: { ...role, personProfileId: existing.id },
    });
  }
  return existing.id;
}

/** A small base rich text document: a heading and a bullet list. */
function outlineDocument(heading: string, points: readonly string[]): unknown {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: heading }],
      },
      {
        type: "bulletList",
        content: points.map((point) => ({
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: point }] },
          ],
        })),
      },
    ],
  };
}

function notesDocument(text: string): unknown {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

function translationsOf(
  sermon: SeedSermon,
): Record<string, Record<string, unknown>> {
  return Object.fromEntries(
    Object.entries(sermon.translations).map(([locale, texts]) => {
      const outline = SEED_OUTLINE[locale];
      const extras =
        sermon.withOutline && outline
          ? {
              outline: outlineDocument(outline.heading, outline.points),
              preacherNotes: notesDocument(outline.notes),
            }
          : {};
      return [locale, { ...texts, ...extras }];
    }),
  );
}

function liveDateOf(sermon: SeedSermon): Date {
  return new Date(`${sermon.preachedOn}T${URL_DATE_HOUR_UTC}:00:00.000Z`);
}

/**
 * Dev data for the sermons: the PREACHER role for two people from the team, one series
 * (Hebrews) and 3 live sermons (es/en/pt) with their platform data loaded by hand: the first has
 * passages, an outline, the preacher's notes and is featured, the last stands outside the series.
 * Idempotent by emptiness: once the organization has any sermon the seed leaves them alone, so CRM
 * edits survive. Revisions are written PUBLISHED directly (what `publish` leaves), so their author
 * is the oldest user holding a role; without one the sermons wait for the next run, like the blog.
 * Needs the people seed first. Never calls the video platform.
 */
export async function seedSermons(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const existing = await client.sermon.count({ where: { organizationId } });
  if (existing > 0) return;

  const authorId = await findAuthorUserId(client, organizationId);
  if (!authorId) {
    console.info("Sermons skipped: no user to author the revisions yet.");
    return;
  }

  const preacherIds = new Map<string, string>();
  for (const [order, name] of SEED_PREACHER_NAMES.entries()) {
    preacherIds.set(
      name,
      await ensurePreacherProfile(client, organizationId, name, order),
    );
  }

  const series = await client.sermonSeries.create({
    data: {
      organizationId,
      plannedCount: SEED_SERIES.plannedCount,
      translations: {
        create: entries(SEED_SERIES.titles).map(([locale, title]) => ({
          locale,
          title,
          slug: SEED_SERIES.slugs[locale as keyof typeof SEED_SERIES.slugs],
          description:
            SEED_SERIES.descriptions[
              locale as keyof typeof SEED_SERIES.descriptions
            ],
          tags: [...SEED_SERIES.tags[locale as keyof typeof SEED_SERIES.tags]],
        })),
      },
    },
  });

  for (const sermon of SEED_SERMONS) {
    const liveAt = liveDateOf(sermon);
    const row = await client.sermon.create({
      data: { organizationId, firstLiveAt: liveAt },
    });
    await client.platformLink.create({
      data: {
        organizationId,
        entityType: "SERMON",
        entityId: row.id,
        platform: "YOUTUBE",
        externalId: sermon.videoId,
        url: `${YOUTUBE_WATCH_URL}${sermon.videoId}`,
        thumbnailUrl: `${YOUTUBE_THUMBNAIL_URL}/${sermon.videoId}/hqdefault.jpg`,
        durationSeconds: sermon.durationSeconds,
        platformPublishedAt: liveAt,
        viewCount: sermon.viewCount,
      },
    });
    const snapshot = sermonSnapshot.parse({
      translations: translationsOf(sermon),
      preacherProfileId: preacherIds.get(sermon.preacher),
      ...(sermon.seriesOrder === undefined
        ? {}
        : { seriesId: series.id, seriesOrder: sermon.seriesOrder }),
      preachedOn: sermon.preachedOn,
      passages: sermon.passages,
      featured: sermon.featured ?? false,
    });
    await client.contentRevision.create({
      data: {
        organizationId,
        contentType: "SERMON",
        entityId: row.id,
        number: 1,
        state: "PUBLISHED",
        snapshot: toJson(snapshot),
        authorId,
        publishedAt: liveAt,
      },
    });
  }
}
