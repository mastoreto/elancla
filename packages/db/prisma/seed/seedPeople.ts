import type { PrismaClient } from "../../src";
import { EL_ANCLA_TEAM } from "./elAnclaTeam";

/**
 * Creates the team shown on /nosotros. Idempotent by emptiness: once the organization has any
 * profile the seed leaves people alone, so edits and deletions made from the CRM survive.
 */
export async function seedPeople(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const existing = await client.personProfile.count({
    where: { organizationId },
  });
  if (existing > 0) return;

  for (const [order, member] of EL_ANCLA_TEAM.entries()) {
    await client.personProfile.create({
      data: {
        organizationId,
        name: member.name,
        translations: {
          create: Object.entries(member.bio).map(([locale, bio]) => ({
            locale,
            bio,
          })),
        },
        roles: {
          create: {
            context: "TEAM",
            visible: true,
            order,
            translations: {
              create: Object.entries(member.title).map(([locale, title]) => ({
                locale,
                title,
              })),
            },
          },
        },
      },
    });
  }
}
