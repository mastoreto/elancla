import type { SiteConfig, VisitContent } from '@ancla/content';
import type { Locale } from 'src/i18n/config';
import { getMessages } from 'src/i18n/messages';
import { buildGeneratedFaqs } from 'src/utils/buildGeneratedFaqs';
import { interpolateFaqAnswers } from 'src/utils/interpolateFaqAnswers';
import { buildSiteTokens } from 'src/utils/siteTokens';

export interface BuildVisitFaqsInput {
  site: SiteConfig;
  visit: VisitContent;
  locale: Locale;
}

/** FAQ shown on the visit page and in llms-full.txt: generated ones first, then the editable. */
export function buildVisitFaqs({
  site,
  visit,
  locale,
}: BuildVisitFaqsInput): { question: string; answer: string }[] {
  return [
    ...buildGeneratedFaqs({
      site,
      texts: getMessages(locale).visit.faq.generated,
      locale,
    }),
    ...interpolateFaqAnswers(visit.faqs, buildSiteTokens(site, locale)),
  ];
}
