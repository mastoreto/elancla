import { getSiteConfig, getVisit, type SiteConfig } from '@ancla/content';
import { getDoctrines } from 'src/data/doctrines';
import {
  entryUrls,
  getSiteIndex,
  type SiteIndexEntry,
} from 'src/data/siteIndex';
import { getMessages } from 'src/i18n/messages';
import { interpolateDeep } from 'src/i18n/utils';
import { buildVisitFaqs } from 'src/utils/buildVisitFaqs';
import { sectionForPath } from 'src/utils/sectionForPath';
import { buildSiteTokens } from 'src/utils/siteTokens';

const stripHtml = (html: string) =>
  html
    .replace(/<\/p>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

function link(entry: SiteIndexEntry, site: SiteConfig, fallbackTitle: string) {
  const url = entryUrls(entry, site.url)[0].url;
  return `- [${entry.title ?? fallbackTitle}](${url})${entry.description ? `: ${entry.description}` : ''}`;
}

function header(site: SiteConfig) {
  const sunday = interpolateDeep(
    getMessages('es').landing.sunday.rows,
    buildSiteTokens(site, 'es')
  );
  return [
    `# ${site.name}`,
    '',
    `> Iglesia bautista en ${site.address.city}, ${site.address.country === 'UY' ? 'Uruguay' : site.address.country}, fundada en ${site.founded}. Comunidad cristiana centrada en el evangelio de Jesucristo y en la Biblia. Cultos abiertos a todos.`,
    '',
    `- Dirección: ${site.address.street}, ${site.address.city} ${site.address.postalCode}`,
    `- Horarios (domingo): ${sunday.map((r) => `${r.time} ${r.title}`).join('; ')}`,
    `- Contacto: ${site.contactEmail}`,
    `- Redes: ${[site.social.youtube, site.social.instagram, site.social.facebook].filter(Boolean).join(', ')}`,
    `- Idiomas del sitio: español (${site.url}), português (${site.url}/pt), English (${site.url}/en)`,
    '',
  ];
}

function sections(entries: SiteIndexEntry[], site: SiteConfig) {
  const pick = (paths: string[]) =>
    entries.filter((e) => paths.includes(e.path));
  const ministries = entries.filter((e) => e.path.startsWith('/ministerios/'));
  const posts = entries.filter((e) => e.kind === 'post');
  const pages = entries.filter((e) => e.kind === 'simplePage');
  const block = (title: string, items: string[]) =>
    items.length ? ['', `## ${title}`, ...items] : [];
  // Fixed entries point into a section; the ones out of service are left out.
  const available = (path: string, line: string) => {
    const section = sectionForPath(path);
    return section && site.sections[section] === 'outOfService' ? [] : [line];
  };
  return [
    ...block('Visitar', [
      ...available(
        '/visitanos',
        `- [Visítanos](${site.url}/visitanos): horarios, cómo llegar y preguntas frecuentes`
      ),
      ...available(
        '/calendario-anual',
        `- [Calendario anual](${site.url}/calendario-anual): actividades y eventos del año`
      ),
    ]),
    ...block('Quiénes somos y qué creemos', [
      ...pick(['/nosotros']).map((e) => link(e, site, 'Nosotros')),
      `- [Confesión de fe](${site.url}/confesion-de-fe): las doctrinas bíblicas que sostienen la iglesia`,
    ]),
    ...block('Enseñanza', [
      ...available(
        '/sermones',
        `- [Sermones](${site.url}/sermones): culto en vivo por YouTube y predicaciones por serie`
      ),
      ...available(
        '/blog',
        `- [Blog](${site.url}/blog): reflexiones y estudios bíblicos`
      ),
    ]),
    ...block(
      'Ministerios',
      ministries.map((e) => link(e, site, e.path))
    ),
    ...block(
      'Más información',
      pages.map((e) => link(e, site, e.path))
    ),
    ...block(
      'Artículos',
      posts.map((e) => link(e, site, e.path))
    ),
  ];
}

export async function buildLlmsTxt(knownSite?: SiteConfig) {
  const site = knownSite ?? (await getSiteConfig());
  const entries = await getSiteIndex(site);
  return [...header(site), ...sections(entries, site).slice(1), ''].join('\n');
}

export async function buildLlmsFullTxt(knownSite?: SiteConfig) {
  const site = knownSite ?? (await getSiteConfig());
  const entries = await getSiteIndex(site);
  const doctrines = getDoctrines('es').flatMap((d) => [
    `### ${d.number}. ${d.title}: ${d.subtitle}`,
    d.summary,
    `${d.verse} (${d.verseRef})`,
    ...d.sections.map((s) => `**${s.h}.** ${stripHtml(s.body)}`),
    '',
  ]);
  const faq =
    site.sections.visit === 'outOfService'
      ? []
      : buildVisitFaqs({
          site,
          visit: await getVisit('es'),
          locale: 'es',
        }).flatMap((item) => [`### ${item.question}`, item.answer, '']);
  return [
    ...header(site),
    ...(faq.length > 0 ? ['## Preguntas frecuentes', '', ...faq] : []),
    '## Confesión de fe',
    '',
    ...doctrines,
    ...sections(entries, site),
    '',
  ].join('\n');
}
