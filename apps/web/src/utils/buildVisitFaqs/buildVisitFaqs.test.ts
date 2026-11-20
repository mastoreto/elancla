import { describe, expect, test } from 'bun:test';
import { SITE_FALLBACK } from '@ancla/content';
import { buildVisitFaqs } from './buildVisitFaqs';

describe('buildVisitFaqs', () => {
  test('puts the generated questions first and fills the editable answers', () => {
    const faqs = buildVisitFaqs({
      site: SITE_FALLBACK,
      visit: {
        directions: { parking: null, transit: null, accessibility: null },
        faqs: [{ question: 'Q', answer: 'Mail {email}' }],
      },
      locale: 'es',
    });
    expect(faqs.length).toBeGreaterThanOrEqual(2);
    expect(faqs.at(-1)).toEqual({
      question: 'Q',
      answer: `Mail ${SITE_FALLBACK.contactEmail}`,
    });
  });
});
