import type { UpdateVisitBody } from "@ancla/contracts";
import type { db, Prisma } from "@ancla/db";

type Client = Prisma.TransactionClient | typeof db;

const faqInclude = {
  translations: true,
} satisfies Prisma.VisitFaqInclude;

export type VisitFaqRow = Prisma.VisitFaqGetPayload<{
  include: typeof faqInclude;
}>;

export function findOrganizationLocaleConfig(
  client: Client,
  organizationId: string,
) {
  return client.organization.findUnique({
    where: { id: organizationId },
    select: { defaultLocale: true, locales: true },
  });
}

/** The settings row that owns the direction texts, with every translation row. */
export function findSettingsWithDirections(
  client: Client,
  organizationId: string,
) {
  return client.siteSettings.findFirst({
    where: { organizationId },
    select: { id: true, name: true, translations: true },
  });
}

export type SettingsWithDirections = NonNullable<
  Awaited<ReturnType<typeof findSettingsWithDirections>>
>;

export function listVisitFaqRows(
  client: Client,
  organizationId: string,
): Promise<VisitFaqRow[]> {
  return client.visitFaq.findMany({
    where: { organizationId },
    include: faqInclude,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
}

/**
 * Replaces the whole list. `order` is the array index, so the stored order always matches what
 * the editor sent. Deleting cascades to the translations.
 */
export async function replaceVisitFaqs(
  tx: Prisma.TransactionClient,
  organizationId: string,
  faqs: UpdateVisitBody["faqs"],
): Promise<void> {
  await tx.visitFaq.deleteMany({ where: { organizationId } });
  for (const [order, faq] of faqs.entries()) {
    await tx.visitFaq.create({
      data: {
        organizationId,
        order,
        translations: {
          create: Object.entries(faq.translations).map(
            ([locale, { question, answer }]) => ({ locale, question, answer }),
          ),
        },
      },
    });
  }
}

/** Blank text is stored as null: "no text" has a single representation. */
const blankToNull = (text: string | null): string | null =>
  text === null || text.trim() === "" ? null : text;

/** Touches only the three direction columns: `seoDescription` stays as it is. */
export function upsertDirections(
  tx: Prisma.TransactionClient,
  input: {
    siteSettingsId: string;
    locale: string;
    directions: UpdateVisitBody["directions"][string];
  },
) {
  const { siteSettingsId, locale, directions } = input;
  const columns = {
    directionsParking: blankToNull(directions.parking),
    directionsTransit: blankToNull(directions.transit),
    directionsAccessibility: blankToNull(directions.accessibility),
  };
  return tx.siteSettingsTranslation.upsert({
    where: { siteSettingsId_locale: { siteSettingsId, locale } },
    create: { siteSettingsId, locale, ...columns },
    update: columns,
  });
}
