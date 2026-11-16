import { defaultLocale, type Locale } from 'src/i18n/config';
import { getMessages } from 'src/i18n/messages';

export interface DoctrineSection {
  h: string;
  body: string;
}

export interface Doctrine {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tag: string;
  summary: string;
  verse: string;
  verseRef: string;
  sections: DoctrineSection[];
  refs: string[];
  featured?: boolean;
}

export function getSolas(locale: Locale = defaultLocale): string[] {
  return [...getMessages(locale).confession.solas];
}

export function getDoctrines(locale: Locale = defaultLocale): Doctrine[] {
  return getMessages(locale).confession.doctrines as Doctrine[];
}

export const solas = getSolas();
export const doctrines = getDoctrines();
