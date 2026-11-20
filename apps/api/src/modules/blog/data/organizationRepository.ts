import type { db, Prisma } from "@ancla/db";

type Client = Prisma.TransactionClient | typeof db;

export interface OrganizationBlogConfig {
  defaultLocale: string;
  locales: string[];
  /** IANA zone: the post URL date and the view day are computed in it. */
  timezone: string;
}

export function findOrganizationBlogConfig(
  client: Client,
  organizationId: string,
): Promise<OrganizationBlogConfig | null> {
  return client.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true, timezone: true },
  });
}
