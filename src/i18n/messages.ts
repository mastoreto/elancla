import esAboutUs from './messages/es/about-us.json';
import esActivities from './messages/es/activities.json';
import esBlog from './messages/es/blog.json';
import esConfession from './messages/es/confession.json';
import esContact from './messages/es/contact.json';
import esContentPages from './messages/es/content-pages.json';
import esFooter from './messages/es/footer.json';
import esHome from './messages/es/home.json';
import esMinistries from './messages/es/ministries.json';
import esNav from './messages/es/nav.json';
import esNotFound from './messages/es/not-found.json';
import esSermons from './messages/es/sermons.json';

import ptAboutUs from './messages/pt/about-us.json';
import ptActivities from './messages/pt/activities.json';
import ptBlog from './messages/pt/blog.json';
import ptConfession from './messages/pt/confession.json';
import ptContact from './messages/pt/contact.json';
import ptContentPages from './messages/pt/content-pages.json';
import ptFooter from './messages/pt/footer.json';
import ptHome from './messages/pt/home.json';
import ptMinistries from './messages/pt/ministries.json';
import ptNav from './messages/pt/nav.json';
import ptNotFound from './messages/pt/not-found.json';
import ptSermons from './messages/pt/sermons.json';

import enAboutUs from './messages/en/about-us.json';
import enActivities from './messages/en/activities.json';
import enBlog from './messages/en/blog.json';
import enConfession from './messages/en/confession.json';
import enContact from './messages/en/contact.json';
import enContentPages from './messages/en/content-pages.json';
import enFooter from './messages/en/footer.json';
import enHome from './messages/en/home.json';
import enMinistries from './messages/en/ministries.json';
import enNav from './messages/en/nav.json';
import enNotFound from './messages/en/not-found.json';
import enSermons from './messages/en/sermons.json';

import { defaultLocale, type Locale } from './config';

export const messages = {
  es: {
    aboutUs: esAboutUs,
    activities: esActivities,
    blog: esBlog,
    confession: esConfession,
    contact: esContact,
    contentPages: esContentPages,
    footer: esFooter,
    home: esHome,
    ministries: esMinistries,
    nav: esNav,
    notFound: esNotFound,
    sermons: esSermons,
  },
  pt: {
    aboutUs: ptAboutUs,
    activities: ptActivities,
    blog: ptBlog,
    confession: ptConfession,
    contact: ptContact,
    contentPages: ptContentPages,
    footer: ptFooter,
    home: ptHome,
    ministries: ptMinistries,
    nav: ptNav,
    notFound: ptNotFound,
    sermons: ptSermons,
  },
  en: {
    aboutUs: enAboutUs,
    activities: enActivities,
    blog: enBlog,
    confession: enConfession,
    contact: enContact,
    contentPages: enContentPages,
    footer: enFooter,
    home: enHome,
    ministries: enMinistries,
    nav: enNav,
    notFound: enNotFound,
    sermons: enSermons,
  },
} as const;

export type Messages = (typeof messages)[typeof defaultLocale];

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages[defaultLocale];
}
