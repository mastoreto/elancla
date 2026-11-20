import type { SiteConfig } from '@ancla/content';
import type { Locale } from 'src/i18n/config';
import { interpolate } from 'src/i18n/interpolate';
import { buildSiteTokens } from 'src/utils/siteTokens';

export interface GeneratedFaq {
  question: string;
  answer: string;
}

interface FaqTemplate {
  /** Fixed i18n question. */
  q: string;
  /** Answer template with `{placeholders}` filled from the site config. */
  a: string;
}

export interface GeneratedFaqTexts {
  when: FaqTemplate & {
    /** Extra sentence, only added when the church has a Bible school slot. */
    bibleSchool: string;
  };
  where: FaqTemplate;
}

export interface BuildGeneratedFaqsInput {
  site: SiteConfig;
  texts: GeneratedFaqTexts;
  locale: Locale;
}

/**
 * The questions whose answer is church data (times, address): they are built from SiteConfig on
 * every render, so changing the schedule or the address changes the answer with no editing.
 */
export function buildGeneratedFaqs({
  site,
  texts,
  locale,
}: BuildGeneratedFaqsInput): GeneratedFaq[] {
  const tokens = buildSiteTokens(site, locale);
  const faqs: GeneratedFaq[] = [];

  // ponytail: without a worship slot / street the question is omitted instead of inventing text.
  if (tokens.worshipTime) {
    const answer = tokens.bibleSchoolTime
      ? `${texts.when.a} ${texts.when.bibleSchool}`
      : texts.when.a;
    faqs.push({
      question: texts.when.q,
      answer: interpolate(answer, tokens),
    });
  }
  if (tokens.street) {
    faqs.push({
      question: texts.where.q,
      answer: interpolate(texts.where.a, tokens),
    });
  }
  return faqs;
}
