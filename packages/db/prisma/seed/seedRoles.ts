import { ADMIN_ROLE, SYSTEM_ROLE_PRESETS } from "@ancla/contracts";
import type { PrismaClient } from "../../src";

/**
 * Creates the seeded roles of an organization. Idempotent by `(organizationId, key)`: an existing
 * role is left untouched, so grids edited from Settings survive a re-seed.
 */
export async function seedRoles(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  await client.role.upsert({
    where: { organizationId_key: { organizationId, key: ADMIN_ROLE.key } },
    create: { organizationId, ...ADMIN_ROLE },
    update: {},
  });

  for (const { grants, ...preset } of SYSTEM_ROLE_PRESETS) {
    await client.role.upsert({
      where: { organizationId_key: { organizationId, key: preset.key } },
      create: {
        organizationId,
        ...preset,
        permissions: { create: grants },
      },
      update: {},
    });
  }
}
