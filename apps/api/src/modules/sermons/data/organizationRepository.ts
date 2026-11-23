import { db, type Prisma } from "@ancla/db";

type Client = Prisma.TransactionClient | typeof db;

export interface OrganizationSermonConfig {
  defaultLocale: string;
  locales: string[];
  /** IANA zone: the day a sermon was preached is computed in it. */
  timezone: string;
}

export function findOrganizationSermonConfig(
  client: Client,
  organizationId: string,
): Promise<OrganizationSermonConfig | null> {
  return client.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true, timezone: true },
  });
}

/** The channel the suggestions and the live status read from; `null` until it is configured. */
export async function findYoutubeChannelId(
  organizationId: string,
): Promise<string | null> {
  const settings = await db.siteSettings.findUnique({
    where: { organizationId },
    select: { youtubeChannelId: true },
  });
  return settings?.youtubeChannelId ?? null;
}
