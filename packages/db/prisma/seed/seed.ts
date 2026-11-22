// Idempotent seed: `bun run db:seed` (Prisma runs it via prisma.config.ts).
import { db } from "../../src";
import {
  EL_ANCLA_ORGANIZATION,
  EL_ANCLA_SEO_DESCRIPTIONS,
  EL_ANCLA_SITE_SETTINGS,
} from "./elAncla";
import { seedBlog } from "./seedBlog";
import { seedCalendar } from "./seedCalendar";
import { seedMinistries } from "./seedMinistries";
import { seedPeople } from "./seedPeople";
import { seedRoles } from "./seedRoles";
import { seedSimplePages } from "./seedSimplePages";
import { seedVisit } from "./seedVisit";

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

  const siteSettings = await db.siteSettings.upsert({
    where: { organizationId: organization.id },
    create: {
      organizationId: organization.id,
      ...EL_ANCLA_SITE_SETTINGS,
    },
    update: {},
  });

  for (const [locale, seoDescription] of Object.entries(
    EL_ANCLA_SEO_DESCRIPTIONS,
  )) {
    await db.siteSettingsTranslation.upsert({
      where: {
        siteSettingsId_locale: { siteSettingsId: siteSettings.id, locale },
      },
      create: { siteSettingsId: siteSettings.id, locale, seoDescription },
      update: {},
    });
  }

  await seedRoles(db, organization.id);
  await seedPeople(db, organization.id);
  await seedMinistries(db, organization.id);
  await seedVisit(db, organization.id);
  await seedSimplePages(db, organization.id);
  await seedBlog(db, organization.id);
  await seedCalendar(db, organization.id);

  console.info(`Seeded organization "${organization.slug}".`);
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
