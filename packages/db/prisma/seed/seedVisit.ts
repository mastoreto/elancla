import type { PrismaClient } from "../../src";
import { EL_ANCLA_VISIT_FAQS } from "./elAnclaVisitFaqs";

/**
 * Creates the editable FAQ of /visitanos. Idempotent by emptiness: once the organization has any
 * question the seed leaves the list alone, so edits and deletions made from the CRM survive.
 */
export async function seedVisit(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const existing = await client.visitFaq.count({ where: { organizationId } });
  if (existing > 0) return;

  for (const [order, faq] of EL_ANCLA_VISIT_FAQS.entries()) {
    await client.visitFaq.create({
      data: {
        organizationId,
        order,
        translations: {
          create: Object.keys(faq.question).map((locale) => ({
            locale,
            question: faq.question[locale] ?? "",
            answer: faq.answer[locale] ?? "",
          })),
        },
      },
    });
  }
}
