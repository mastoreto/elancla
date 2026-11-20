import {
  VISIT_DIRECTION_MAX_LENGTH,
  VISIT_FAQ_ANSWER_MAX_LENGTH,
  VISIT_FAQ_QUESTION_MAX_LENGTH,
} from "@ancla/contracts";
import type {
  DirectionKey,
  FaqFormErrors,
  FaqFormValues,
  SiteLocales,
  VisitFormErrors,
  VisitFormValues,
} from "../../types";
import { DIRECTION_KEYS } from "../visitFormValues";

const isBlank = (text: string | undefined): boolean => (text ?? "").trim() === "";

function tooLong(texts: Record<string, string>, locales: readonly string[], max: number): boolean {
  return locales.some((locale) => (texts[locale] ?? "").trim().length > max);
}

function textError(
  texts: Record<string, string>,
  { locales, defaultLocale }: SiteLocales,
  max: number,
  missingMessage: string,
): string | undefined {
  if (isBlank(texts[defaultLocale])) return missingMessage;
  if (tooLong(texts, locales, max)) return `Máximo ${max} caracteres.`;
  return undefined;
}

/** A language with only half of the pair would be dropped on save, so it is reported instead. */
function halfFilledLocale(faq: FaqFormValues, locales: readonly string[]): boolean {
  return locales.some((locale) => isBlank(faq.questions[locale]) !== isBlank(faq.answers[locale]));
}

function faqErrors(faq: FaqFormValues, site: SiteLocales): FaqFormErrors {
  const errors: FaqFormErrors = {};
  const question = textError(
    faq.questions,
    site,
    VISIT_FAQ_QUESTION_MAX_LENGTH,
    "Escribe la pregunta en el idioma obligatorio.",
  );
  const answer = textError(
    faq.answers,
    site,
    VISIT_FAQ_ANSWER_MAX_LENGTH,
    "Escribe la respuesta en el idioma obligatorio.",
  );
  if (question) errors.question = question;
  if (answer) errors.answer = answer;
  if (!(question || answer) && halfFilledLocale(faq, site.locales)) {
    errors.answer = "Cada idioma necesita pregunta y respuesta, o ninguna de las dos.";
  }
  return errors;
}

/** Client-side mirror of the API rules, so the form can point at the field before sending. */
export function validateVisitForm(values: VisitFormValues, site: SiteLocales): VisitFormErrors {
  const errors: VisitFormErrors = { directions: {}, faqs: {} };
  for (const key of DIRECTION_KEYS) {
    if (tooLong(values.directions[key], site.locales, VISIT_DIRECTION_MAX_LENGTH)) {
      errors.directions[key as DirectionKey] = `Máximo ${VISIT_DIRECTION_MAX_LENGTH} caracteres.`;
    }
  }
  for (const faq of values.faqs) {
    const found = faqErrors(faq, site);
    if (found.question || found.answer) errors.faqs[faq.key] = found;
  }
  return errors;
}

export function hasVisitErrors(errors: VisitFormErrors): boolean {
  return Object.keys(errors.directions).length > 0 || Object.keys(errors.faqs).length > 0;
}
