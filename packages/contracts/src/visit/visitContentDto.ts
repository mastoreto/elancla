import { z } from "zod";

export const MAX_VISIT_FAQS = 30;
export const VISIT_DIRECTION_MAX_LENGTH = 600;
export const VISIT_FAQ_QUESTION_MAX_LENGTH = 200;
export const VISIT_FAQ_ANSWER_MAX_LENGTH = 1000;

/** The three direction texts of the visit page, in one locale. */
const directionsTranslationDto = z.strictObject({
  parking: z.string().trim().max(VISIT_DIRECTION_MAX_LENGTH).nullable(),
  transit: z.string().trim().max(VISIT_DIRECTION_MAX_LENGTH).nullable(),
  accessibility: z.string().trim().max(VISIT_DIRECTION_MAX_LENGTH).nullable(),
});

const faqTranslationDto = z.strictObject({
  question: z.string().trim().min(1).max(VISIT_FAQ_QUESTION_MAX_LENGTH),
  answer: z.string().trim().min(1).max(VISIT_FAQ_ANSWER_MAX_LENGTH),
});

/** Visit page content as the CRM edits it. FAQs come back in display order. */
export const visitContentDto = z.strictObject({
  directions: z.record(z.string(), directionsTranslationDto),
  faqs: z.array(
    z.strictObject({
      id: z.uuid(),
      order: z.number().int().min(0),
      translations: z.record(z.string(), faqTranslationDto),
    }),
  ),
  locales: z.array(z.string()),
  defaultLocale: z.string(),
});
export type VisitContentDto = z.infer<typeof visitContentDto>;

/**
 * PUT body. `faqs` is the complete list (its array order is the display order) and replaces
 * whatever was stored; `directions` replaces only the locales sent. Locales the organization
 * does not use are rejected and every FAQ needs the default-locale translation (400).
 */
export const updateVisitBody = z.strictObject({
  directions: z.record(z.string(), directionsTranslationDto),
  faqs: z
    .array(
      z.strictObject({ translations: z.record(z.string(), faqTranslationDto) }),
    )
    .max(MAX_VISIT_FAQS),
});
export type UpdateVisitBody = z.infer<typeof updateVisitBody>;
