import { describe, expect, test } from 'bun:test';
import { sectionForPath } from './sectionForPath';

describe('sectionForPath', () => {
  test('maps each section root and its subpaths', () => {
    expect(sectionForPath('/blog')).toBe('blog');
    expect(sectionForPath('/blog/2026/01/02/post')).toBe('blog');
    expect(sectionForPath('/calendario-anual')).toBe('calendar');
    expect(sectionForPath('/calendario-anual/imprimir/a4')).toBe('calendar');
    expect(sectionForPath('/calendario-anual.ics')).toBe('calendar');
    expect(sectionForPath('/sermones')).toBe('sermons');
    expect(sectionForPath('/ministerios/jovenes')).toBe('ministries');
    expect(sectionForPath('/visitanos')).toBe('visit');
  });

  test('ignores the locale prefix, a trailing slash and the query', () => {
    expect(sectionForPath('/en/blog')).toBe('blog');
    expect(sectionForPath('/pt/visitanos/')).toBe('visit');
    expect(sectionForPath('/sermones?serie=x')).toBe('sermons');
  });

  test('returns null for everything else', () => {
    expect(sectionForPath('/')).toBeNull();
    expect(sectionForPath('/nosotros')).toBeNull();
    expect(sectionForPath('/blogger')).toBeNull();
    expect(sectionForPath('/en')).toBeNull();
    expect(sectionForPath('/404')).toBeNull();
  });
});
