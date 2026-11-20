import { defaultLocale, type Locale } from './config';
import enBlog from './messages/en/blog.json';
import enCalendar from './messages/en/calendar.json';
import enConfession from './messages/en/confession.json';
import enContentPages from './messages/en/content-pages.json';
import enFooter from './messages/en/footer.json';
import enHome from './messages/en/home.json';
import enLanding from './messages/en/landing.json';
import enMinistries from './messages/en/ministries.json';
import enNav from './messages/en/nav.json';
import enNotFound from './messages/en/not-found.json';
import enSermonsPage from './messages/en/sermons-page.json';
import enSimplePage from './messages/en/simple-page.json';
import enSiteStatus from './messages/en/site-status.json';
import enVisit from './messages/en/visit.json';
import esBlog from './messages/es/blog.json';
import esCalendar from './messages/es/calendar.json';
import esConfession from './messages/es/confession.json';
import esContentPages from './messages/es/content-pages.json';
import esFooter from './messages/es/footer.json';
import esHome from './messages/es/home.json';
import esLanding from './messages/es/landing.json';
import esMinistries from './messages/es/ministries.json';
import esNav from './messages/es/nav.json';
import esNotFound from './messages/es/not-found.json';
import esSermonsPage from './messages/es/sermons-page.json';
import esSimplePage from './messages/es/simple-page.json';
import esSiteStatus from './messages/es/site-status.json';
import esVisit from './messages/es/visit.json';
import ptBlog from './messages/pt/blog.json';
import ptCalendar from './messages/pt/calendar.json';
import ptConfession from './messages/pt/confession.json';
import ptContentPages from './messages/pt/content-pages.json';
import ptFooter from './messages/pt/footer.json';
import ptHome from './messages/pt/home.json';
import ptLanding from './messages/pt/landing.json';
import ptMinistries from './messages/pt/ministries.json';
import ptNav from './messages/pt/nav.json';
import ptNotFound from './messages/pt/not-found.json';
import ptSermonsPage from './messages/pt/sermons-page.json';
import ptSimplePage from './messages/pt/simple-page.json';
import ptSiteStatus from './messages/pt/site-status.json';
import ptVisit from './messages/pt/visit.json';

export const messages = {
  es: {
    blog: esBlog,
    calendar: esCalendar,
    confession: esConfession,
    contentPages: esContentPages,
    footer: esFooter,
    home: esHome,
    landing: esLanding,
    ministries: esMinistries,
    nav: esNav,
    notFound: esNotFound,
    sermonsPage: esSermonsPage,
    simplePage: esSimplePage,
    visit: esVisit,
    siteStatus: esSiteStatus,
  },
  pt: {
    blog: ptBlog,
    calendar: ptCalendar,
    confession: ptConfession,
    contentPages: ptContentPages,
    footer: ptFooter,
    home: ptHome,
    landing: ptLanding,
    ministries: ptMinistries,
    nav: ptNav,
    notFound: ptNotFound,
    sermonsPage: ptSermonsPage,
    simplePage: ptSimplePage,
    visit: ptVisit,
    siteStatus: ptSiteStatus,
  },
  en: {
    blog: enBlog,
    calendar: enCalendar,
    confession: enConfession,
    contentPages: enContentPages,
    footer: enFooter,
    home: enHome,
    landing: enLanding,
    ministries: enMinistries,
    nav: enNav,
    notFound: enNotFound,
    sermonsPage: enSermonsPage,
    simplePage: enSimplePage,
    visit: enVisit,
    siteStatus: enSiteStatus,
  },
} as const;

export type Messages = (typeof messages)[typeof defaultLocale];

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages[defaultLocale];
}
