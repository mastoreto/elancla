import { describe, expect, test } from 'bun:test';
import { SITE_FALLBACK, type SiteConfig } from '@ancla/content';
import {
  buildGeneratedFaqs,
  type GeneratedFaqTexts,
} from './buildGeneratedFaqs';

const TEXTS: GeneratedFaqTexts = {
  when: {
    q: 'When?',
    a: 'Sundays at {worshipTime}.',
    bibleSchool: 'Bible school at {bibleSchoolTime}.',
  },
  where: { q: 'Where?', a: '{street}, {city}.' },
};

function siteWith(overrides: Partial<SiteConfig>): SiteConfig {
  return { ...SITE_FALLBACK, ...overrides };
}

describe('buildGeneratedFaqs', () => {
  test('answers the schedule and the address from the site config', () => {
    const site = siteWith({
      serviceTimes: [
        { kind: 'worship', weekday: 0, start: '10:00', end: '12:00' },
        { kind: 'bibleSchool', weekday: 0, start: '09:00', end: null },
      ],
      address: { ...SITE_FALLBACK.address, street: 'Calle 1', city: 'Ciudad' },
    });
    expect(buildGeneratedFaqs({ site, texts: TEXTS, locale: 'en' })).toEqual([
      {
        question: 'When?',
        answer: 'Sundays at 10:00. Bible school at 09:00.',
      },
      { question: 'Where?', answer: 'Calle 1, Ciudad.' },
    ]);
  });

  test('changing serviceTimes changes the answer', () => {
    const answerFor = (start: string): string | undefined =>
      buildGeneratedFaqs({
        site: siteWith({
          serviceTimes: [{ kind: 'worship', weekday: 0, start, end: null }],
        }),
        texts: TEXTS,
        locale: 'es',
      })[0]?.answer;
    expect(answerFor('10:00')).toBe('Sundays at 10:00.');
    expect(answerFor('18:30')).toBe('Sundays at 18:30.');
  });

  test('the summer schedule the API serves is the one the visit page answers with', () => {
    // What GET settings returns while the "Verano" set is in force (see the API tests).
    const summerTimes: SiteConfig['serviceTimes'] = [
      { kind: 'worship', weekday: 0, start: '09:30', end: '11:00' },
      { kind: 'bibleSchool', weekday: 0, start: '08:30', end: null },
    ];
    const site = siteWith({ serviceTimes: summerTimes });
    const [when] = buildGeneratedFaqs({ site, texts: TEXTS, locale: 'es' });
    expect(when?.answer).toBe('Sundays at 09:30. Bible school at 08:30.');
  });

  test('omits the schedule question without a worship slot', () => {
    const faqs = buildGeneratedFaqs({
      site: siteWith({ serviceTimes: [] }),
      texts: TEXTS,
      locale: 'es',
    });
    expect(faqs.map((faq) => faq.question)).toEqual(['Where?']);
  });

  test('omits the address question without a street', () => {
    const faqs = buildGeneratedFaqs({
      site: siteWith({ address: { ...SITE_FALLBACK.address, street: '' } }),
      texts: TEXTS,
      locale: 'es',
    });
    expect(faqs.map((faq) => faq.question)).toEqual(['When?']);
  });
});
