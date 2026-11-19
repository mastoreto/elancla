import type { PrismaClient } from "../../src";

/** Sample ministries so the `ministry` scope is usable locally. Phase 1.5 owns the real ones. */
const SAMPLE_MINISTRIES = [
  { slug: "alabanza", name: "Alabanza" },
  { slug: "jovenes", name: "Jóvenes" },
  { slug: "ninos", name: "Niños" },
] as const;

export async function seedMinistries(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  for (const ministry of SAMPLE_MINISTRIES) {
    await client.ministry.upsert({
      where: {
        organizationId_slug: { organizationId, slug: ministry.slug },
      },
      create: { organizationId, ...ministry },
      update: {},
    });
  }
}
