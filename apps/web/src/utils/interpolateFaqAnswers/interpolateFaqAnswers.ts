import { interpolate } from 'src/i18n/interpolate';

interface EditableFaq {
  question: string;
  answer: string;
}

/**
 * Editable answers may carry site placeholders (`{worshipEnd}`, `{email}`) so they follow the
 * SiteConfig. An unknown placeholder stays visible, so a typo shows up in review.
 */
export function interpolateFaqAnswers<T extends EditableFaq>(
  faqs: readonly T[],
  tokens: Readonly<Record<string, string>>
): T[] {
  return faqs.map((faq) => ({
    ...faq,
    answer: interpolate(faq.answer, tokens),
  }));
}
