// Idempotent seed: `bun run db:seed` (Prisma runs it via prisma.config.ts).
import { db } from "../../src";
import { EL_ANCLA_ORGANIZATION, EL_ANCLA_SITE_SETTINGS } from "./elAncla";
import { seedMinistries } from "./seedMinistries";
import { seedRoles } from "./seedRoles";

async function seed(): Promise<void> {
  const organization = await db.organization.upsert({
    where: { slug: EL_ANCLA_ORGANIZATION.slug },
    create: {
      ...EL_ANCLA_ORGANIZATION,
      locales: [...EL_ANCLA_ORGANIZATION.locales],
      currencies: [...EL_ANCLA_ORGANIZATION.currencies],
    },
    update: {},
  });

  await db.siteSettings.upsert({
    where: { organizationId: organization.id },
    create: { organizationId: organization.id, ...EL_ANCLA_SITE_SETTINGS },
    update: {},
  });

  await seedRoles(db, organization.id);
  await seedMinistries(db, organization.id);

  console.info(`Seeded organization "${organization.slug}".`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
