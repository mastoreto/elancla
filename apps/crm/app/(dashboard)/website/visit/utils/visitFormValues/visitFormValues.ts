import type { UpdateVisitBody, VisitContentDto } from "@ancla/contracts";
import type { DirectionKey, VisitFormValues } from "../../types";

export const DIRECTION_KEYS: readonly DirectionKey[] = ["parking", "transit", "accessibility"];

function blankToNull(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/** Keeps only the non-empty (trimmed) values, so a blank language is not sent. */
function nonEmptyTexts(texts: Record<string, string>, locales: readonly string[]): string[] {
  return locales.filter((locale) => (texts[locale] ?? "").trim() !== "");
}

function directionValues(content: VisitContentDto, key: DirectionKey): Record<string, string> {
  return Object.fromEntries(
    content.locales.map((locale) => [locale, content.directions[locale]?.[key] ?? ""]),
  );
}

export function toVisitFormValues(content: VisitContentDto): VisitFormValues {
  const faqs = [...content.faqs]
    .sort((a, b) => a.order - b.order)
    .map((faq) => ({
      key: faq.id,
      questions: Object.fromEntries(
        Object.entries(faq.translations).map(([locale, text]) => [locale, text.question]),
      ),
      answers: Object.fromEntries(
        Object.entries(faq.translations).map(([locale, text]) => [locale, text.answer]),
      ),
    }));
  return {
    directions: {
      parking: directionValues(content, "parking"),
      transit: directionValues(content, "transit"),
      accessibility: directionValues(content, "accessibility"),
    },
    faqs,
  };
}

/** The PUT body: array order is the display order; blank languages are left out. */
export function toUpdateVisitBody(
  values: VisitFormValues,
  locales: readonly string[],
): UpdateVisitBody {
  return {
    directions: Object.fromEntries(
      locales.map((locale) => [
        locale,
        {
          parking: blankToNull(values.directions.parking[locale]),
          transit: blankToNull(values.directions.transit[locale]),
          accessibility: blankToNull(values.directions.accessibility[locale]),
        },
      ]),
    ),
    faqs: values.faqs.map((faq) => ({
      translations: Object.fromEntries(
        nonEmptyTexts({ ...faq.questions }, locales)
          // A language needs both texts; validation already flagged half-filled ones.
          .filter((locale) => (faq.answers[locale] ?? "").trim() !== "")
          .map((locale) => [
            locale,
            {
              question: (faq.questions[locale] ?? "").trim(),
              answer: (faq.answers[locale] ?? "").trim(),
            },
          ]),
      ),
    })),
  };
}
