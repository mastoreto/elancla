import { ministrySnapshot } from "@ancla/contracts";
import type { Prisma, PrismaClient } from "../../src";
import {
  EL_ANCLA_MINISTRIES,
  EL_ANCLA_MINISTRY_CATEGORIES,
  type SeedMinistry,
} from "./elAnclaMinistries";

const LEADER_MINISTRY_SLUG = "predicacion";
const LEADER_NAME = "Pr. Juan Olivera";
const LEADER_TITLES: Record<string, string> = {
  es: "Pastor principal",
  en: "Lead pastor",
  pt: "Pastor principal",
};

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

async function ensureCategoryIds(
  client: PrismaClient,
  organizationId: string,
): Promise<string[]> {
  const existing = await client.ministryCategory.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  if (existing.length >= EL_ANCLA_MINISTRY_CATEGORIES.length) {
    return existing.map(({ id }) => id);
  }
  const ids: string[] = [];
  for (const category of EL_ANCLA_MINISTRY_CATEGORIES) {
    const created = await client.ministryCategory.create({
      data: {
        organizationId,
        order: category.order,
        translations: {
          create: Object.entries(category.names).map(([locale, name]) => ({
            locale,
            name,
          })),
        },
      },
    });
    ids.push(created.id);
  }
  return ids;
}

async function upsertMinistry(
  client: PrismaClient,
  organizationId: string,
  ministry: SeedMinistry,
  categoryId: string | undefined,
): Promise<string> {
  const settings = {
    name: ministry.names.es as string,
    categoryId,
    destination: ministry.destination,
    externalUrl: ministry.externalUrl ?? null,
    icon: ministry.icon,
    color: ministry.color,
    showOnLanding: true,
    landingOrder: ministry.landingOrder,
    landingTile: "COLOR" as const,
    landingTone: ministry.landingTone,
  };
  const row = await client.ministry.upsert({
    where: {
      organizationId_slug: { organizationId, slug: ministry.slug },
    },
    create: { organizationId, slug: ministry.slug, ...settings },
    update: settings,
    select: { id: true },
  });
  return row.id;
}

function snapshotOf(ministry: SeedMinistry): unknown {
  const translations = Object.fromEntries(
    Object.entries(ministry.names).map(([locale, name]) => {
      const tagline = ministry.taglines[locale] as string;
      return [
        locale,
        {
          name,
          slug: ministry.slug,
          tagline,
          about: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: tagline }],
              },
            ],
          },
        },
      ];
    }),
  );
  return ministrySnapshot.parse({ translations });
}

/** One visible leader on one ministry, so the public detail has a real one in dev. */
async function seedLeader(
  client: PrismaClient,
  organizationId: string,
  ministryId: string,
): Promise<void> {
  const profile = await client.personProfile.findFirst({
    where: { organizationId, name: LEADER_NAME },
    select: { id: true },
  });
  if (!profile) return;
  const existing = await client.personRole.findFirst({
    where: {
      personProfileId: profile.id,
      context: "MINISTRY_LEADER",
      ministryId,
    },
    select: { id: true },
  });
  if (existing) return;
  await client.personRole.create({
    data: {
      personProfileId: profile.id,
      context: "MINISTRY_LEADER",
      ministryId,
      visible: true,
      order: 0,
      translations: {
        create: Object.entries(LEADER_TITLES).map(([locale, title]) => ({
          locale,
          title,
        })),
      },
    },
  });
}

/**
 * Dev data for ministries: the 13 real ones of the landing mosaic, 2 categories, a published
 * profile (es/en/pt) each and one visible leader. Idempotent by revisions: once the organization
 * has any ministry revision the seed leaves ministries alone, so CRM edits survive.
 *
 * Revisions are written PUBLISHED directly (what `publish` leaves), so their author is the oldest
 * user holding a role. ponytail: like the blog, a brand new database gets the profiles the first
 * time the seed runs after the first admin exists; the rows and categories do not wait for it.
 * Needs the people seed to have run first (the leader is a team profile).
 */
export async function seedMinistries(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const published = await client.contentRevision.count({
    where: { organizationId, contentType: "MINISTRY" },
  });
  if (published > 0) return;

  const categoryIds = await ensureCategoryIds(client, organizationId);
  const ministryIds = new Map<string, string>();
  for (const ministry of EL_ANCLA_MINISTRIES) {
    const id = await upsertMinistry(
      client,
      organizationId,
      ministry,
      categoryIds[ministry.categoryIndex],
    );
    ministryIds.set(ministry.slug, id);
  }

  const authorId = await findAuthorUserId(client, organizationId);
  if (!authorId) {
    console.info("Ministry profiles skipped: no user to author them yet.");
    return;
  }

  for (const ministry of EL_ANCLA_MINISTRIES) {
    await client.contentRevision.create({
      data: {
        organizationId,
        contentType: "MINISTRY",
        entityId: ministryIds.get(ministry.slug) as string,
        number: 1,
        state: "PUBLISHED",
        snapshot: toJson(snapshotOf(ministry)),
        authorId,
        publishedAt: new Date(),
      },
    });
  }
  await seedLeader(
    client,
    organizationId,
    ministryIds.get(LEADER_MINISTRY_SLUG) as string,
  );
}
