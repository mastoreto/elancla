import { describe, expect, test } from 'bun:test';
import { SITE_FALLBACK } from '@ancla/content';
import { buildSiteTokens, handleFromUrl } from './siteTokens';

describe('handleFromUrl', () => {
  test('takes the last path segment as a handle', () => {
    expect(handleFromUrl('https://youtube.com/@canal')).toBe('@canal');
    expect(handleFromUrl('https://www.instagram.com/iglesia/')).toBe(
      '@iglesia'
    );
  });

  test('is empty without a profile path', () => {
    expect(handleFromUrl(undefined)).toBe('');
    expect(handleFromUrl('https://example.org')).toBe('');
  });
});

describe('buildSiteTokens', () => {
  test('derives times, address, host and handles from the site config', () => {
    const tokens = buildSiteTokens(
      {
        ...SITE_FALLBACK,
        url: 'https://iglesia.example.org',
        contactEmail: 'hola@iglesia.example.org',
        address: {
          ...SITE_FALLBACK.address,
          street: 'Calle Falsa 123, esq. Sur',
        },
        social: { youtube: 'https://youtube.com/@canal' },
      },
      'es'
    );
    expect(tokens.worshipTime).toBe(SITE_FALLBACK.serviceTimes[0]?.start);
    expect(tokens.worshipShort).toBe(`Dom · ${tokens.worshipTime}`);
    expect(tokens.street).toBe('Calle Falsa 123, esq. Sur');
    expect(tokens.streetShort).toBe('Calle Falsa 123');
    expect(tokens.host).toBe('iglesia.example.org');
    expect(tokens.email).toBe('hola@iglesia.example.org');
    expect(tokens.youtubeHandle).toBe('@canal');
    expect(tokens.country).toBe('Uruguay');
  });

  test('leaves out what is not set so the placeholder stays visible', () => {
    const tokens = buildSiteTokens(
      { ...SITE_FALLBACK, serviceTimes: [] },
      'en'
    );
    expect(tokens.worshipTime).toBeUndefined();
    expect(tokens.instagramHandle).toBe(
      handleFromUrl(SITE_FALLBACK.social.instagram)
    );
  });
});
