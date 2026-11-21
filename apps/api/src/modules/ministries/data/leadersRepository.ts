import type { MinistryLeadersBody } from "@ancla/contracts";
import type { db, Prisma } from "@ancla/db";

type Client = Prisma.TransactionClient | typeof db;

const leaderInclude = {
  personProfile: { select: { name: true } },
  translations: true,
} satisfies Prisma.PersonRoleInclude;

export type MinistryLeaderRow = Prisma.PersonRoleGetPayload<{
  include: typeof leaderInclude;
}>;

export function listLeaderRows(
  client: Client,
  ministryId: string,
): Promise<MinistryLeaderRow[]> {
  return client.personRole.findMany({
    where: { context: "MINISTRY_LEADER", ministryId },
    include: leaderInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

/** The `ids` that are profiles of the organization. */
export async function findPersonProfileIds(
  tx: Prisma.TransactionClient,
  organizationId: string,
  ids: readonly string[],
): Promise<string[]> {
  const rows = await tx.personProfile.findMany({
    where: { organizationId, id: { in: [...ids] } },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

/**
 * Replaces the leaders of one ministry. The old rows go first, in their own statement, so the
 * unique key never sees the old and the new row of a person together.
 */
export async function replaceLeaderRows(
  tx: Prisma.TransactionClient,
  ministryId: string,
  leaders: MinistryLeadersBody,
): Promise<MinistryLeaderRow[]> {
  await tx.personRole.deleteMany({
    where: { context: "MINISTRY_LEADER", ministryId },
  });
  for (const leader of leaders) {
    await tx.personRole.create({
      data: {
        personProfileId: leader.personProfileId,
        context: "MINISTRY_LEADER",
        ministryId,
        visible: leader.visible,
        order: leader.order,
        translations: {
          create: Object.entries(leader.translations).map(
            ([locale, { title }]) => ({ locale, title }),
          ),
        },
      },
    });
  }
  return listLeaderRows(tx, ministryId);
}
