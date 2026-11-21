import type { db, Prisma } from "@ancla/db";

type Client = Prisma.TransactionClient | typeof db;

export function findOrganizationLocales(
  client: Client,
  organizationId: string,
): Promise<{ defaultLocale: string; locales: string[] } | null> {
  return client.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true },
  });
}
