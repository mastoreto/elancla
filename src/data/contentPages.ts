import ministriesData from 'src/utils/ministriesData.json';

export type ContentPageRouteGroup = 'root' | 'ministerios';

export interface ContentInlineText {
  text?: string;
  before?: string;
  emphasis?: string;
  after?: string;
}

export interface ContentHeroStat {
  value: string;
  label: string;
}

export interface ContentBreadcrumb {
  label: string;
  href?: string;
}

export interface ContentHero {
  breadcrumbs: ContentBreadcrumb[];
  chip?: string;
  meta: string[];
  titleLines: ContentInlineText[];
  standfirst: string;
  stats?: ContentHeroStat[];
}

export interface ContentFigureData {
  src: string;
  alt: string;
  label: string;
  caption: string;
  badge?: string;
  meta?: string;
  aspect?: 'wide' | 'landscape' | 'portrait';
}

export interface ContentValue {
  number: string;
  title: string;
  description: string;
}

export interface ContentAsideNote {
  label: string;
  html: string;
}

export interface ContentTimelineItem {
  year: string;
  title: string;
  description: string;
  isCurrent?: boolean;
}

export interface ContentPerson {
  name: string;
  role: string;
  bio: string;
  initials: string;
  tint?: string;
}

export interface ContentLink {
  title: string;
  description: string;
  href: string;
  sourceLabel: string;
  meta: string;
  glyph: string;
  external?: boolean;
  tint?: string;
}

export interface ContentShortcut {
  label: string;
  href: string;
}

export interface ContentCta {
  eyebrow: string;
  title: ContentInlineText;
  body: string;
  primary: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
}

export interface ContentProseBlock {
  type: 'prose';
  paragraphs: string[];
}

export interface ContentVerseBlock {
  type: 'verse';
  reference: string;
  text: string;
}

export interface ContentValuesBlock {
  type: 'values';
  values: ContentValue[];
  note?: ContentAsideNote;
}

export interface ContentTimelineBlock {
  type: 'timeline';
  items: ContentTimelineItem[];
}

export interface ContentPullquoteBlock {
  type: 'pullquote';
  quote: string;
  cite?: string;
}

export interface ContentFigureBlock {
  type: 'figure';
  figure: ContentFigureData;
}

export interface ContentTeamBlock {
  type: 'team';
  people: ContentPerson[];
}

export interface ContentLinkGridBlock {
  type: 'linkGrid';
  links: ContentLink[];
}

export interface ContentCtaBlock {
  type: 'cta';
  cta: ContentCta;
}

export type ContentBlock =
  | ContentProseBlock
  | ContentVerseBlock
  | ContentValuesBlock
  | ContentTimelineBlock
  | ContentPullquoteBlock
  | ContentFigureBlock
  | ContentTeamBlock
  | ContentLinkGridBlock
  | ContentCtaBlock;

export interface ContentSection {
  id: string;
  eyebrow: string;
  tocLabel: string;
  title: ContentInlineText;
  description?: string;
  blocks: ContentBlock[];
}

export interface ContentPage {
  routeGroup: ContentPageRouteGroup;
  slug: string;
  aliases?: string[];
  title: string;
  seoTitle?: string;
  description: string;
  hero: ContentHero;
  featuredImage?: ContentFigureData;
  shortcuts?: ContentShortcut[];
  sections: ContentSection[];
  cta?: ContentCta;
}

const nosotrosPage: ContentPage = {
  routeGroup: 'root',
  slug: 'nosotros',
  title: 'Nosotros',
  seoTitle: 'Nosotros | Iglesia Bautista El Ancla',
  description:
    'Conocé quiénes somos, en qué creemos y cómo vivimos la fe como Iglesia Bautista El Ancla en Montevideo.',
  hero: {
    breadcrumbs: [
      { label: 'El Ancla', href: '/' },
      { label: 'Nosotros' },
    ],
    chip: 'Iglesia',
    meta: ['Sec. 01 / Nosotros', 'Montevideo · UY'],
    titleLines: [
      { text: 'Una iglesia con' },
      { emphasis: 'ancla', after: ' en el' },
      { text: 'evangelio.' },
    ],
    standfirst:
      'Conocer una iglesia es un gran desafío en estos tiempos. Esperamos que con la información que encuentres aquí, puedas tener un mayor panorama de quiénes somos, en qué creemos y cómo vivimos la fe en Montevideo desde 1997.',
    stats: [
      { value: '29', label: 'Años' },
      { value: '10', label: 'Ministerios' },
      { value: '∞', label: 'Gracia' },
    ],
  },
  featuredImage: {
    src: '/images/homebanner.jpeg',
    alt: 'Casa de la Iglesia Bautista El Ancla en Montevideo',
    label: '[ FIG.01 ]',
    caption: 'Casa de la iglesia · Av. Dr. Luis A. de Herrera 3101 esq. Juan Arrieta.',
    badge: 'Av. L. A. de Herrera 3101',
    meta: '— Montevideo · UY',
    aspect: 'wide',
  },
  shortcuts: [
    { label: 'Confesión de fe', href: '/confesion-de-fe' },
    { label: 'Ministerios', href: '/#ministerios' },
    { label: 'Cómo visitarnos', href: '/#visitanos' },
    { label: 'Blog', href: '/blog' },
  ],
  sections: [
    {
      id: 'identidad',
      eyebrow: '01 — Identidad',
      tocLabel: 'Quiénes somos',
      title: { before: 'Gracias por querer ', emphasis: 'conocernos.' },
      blocks: [
        {
          type: 'prose',
          paragraphs: [
            'Somos una <strong>comunidad cristiana bautista</strong> en el corazón de Montevideo. Nos reunimos hace casi tres décadas alrededor de la Palabra, los sacramentos y la oración. No somos una iglesia perfecta —ni queremos serlo— pero sí una iglesia honesta, que intenta vivir el evangelio en lo cotidiano.',
            'Nuestro nombre viene de <strong>Hebreos 6:19</strong>: «tenemos esta esperanza como firme y segura ancla del alma». Esa imagen resume bien lo que somos: un grupo de personas comunes agarradas a algo que nos sostiene cuando las circunstancias se mueven.',
          ],
        },
        {
          type: 'verse',
          reference: 'Hebreos 6 · 19',
          text: 'La cual tenemos como segura y firme ancla del alma, y que penetra hasta dentro del velo.',
        },
      ],
    },
    {
      id: 'valores',
      eyebrow: '02 — Confesión',
      tocLabel: 'Lo que creemos',
      title: { before: 'Tres convicciones que nos ', emphasis: 'ordenan.' },
      description:
        'Una iglesia no se define solo por lo que dice creer, sino por lo que organiza su vida. Estas son las tres convicciones que ordenan, en la práctica, casi todo lo que hacemos.',
      blocks: [
        {
          type: 'values',
          values: [
            {
              number: 'I.',
              title: 'Centrados en Cristo',
              description:
                'La cruz y la resurrección no son temas entre otros: son el centro de nuestra predicación, nuestro canto y nuestra pastoral.',
            },
            {
              number: 'II.',
              title: 'Fieles a la Palabra',
              description:
                'Las Escrituras son nuestra autoridad final en doctrina y en práctica. Por eso predicamos textos enteros, no solo versículos sueltos.',
            },
            {
              number: 'III.',
              title: 'Familia de la fe',
              description:
                'Crecemos juntos, en hospitalidad, servicio y oración. La fe se aprende caminando con otros, no a solas.',
            },
          ],
          note: {
            label: 'Nota · Confesión',
            html: 'Si querés leer en detalle qué creemos, redactamos una <a href="/confesion-de-fe">Confesión de Fe</a> organizada en doce artículos. Es la versión larga y cuidadosa de lo que aquí resumimos en tres palabras.',
          },
        },
      ],
    },
    {
      id: 'historia',
      eyebrow: '03 — Camino',
      tocLabel: 'Nuestra historia',
      title: { before: 'Casi tres décadas ', emphasis: 'en la misma esquina.' },
      description:
        'La historia de El Ancla cabe en una avenida y unas pocas familias que decidieron quedarse. Estos son los hitos que dieron forma a lo que somos hoy.',
      blocks: [
        {
          type: 'timeline',
          items: [
            {
              year: '1997',
              title: 'Fundación',
              description: 'Un puñado de familias en una casa prestada del Cordón.',
            },
            {
              year: '2003',
              title: 'Mudanza a Herrera',
              description: 'El templo actual abre sus puertas en Av. de Herrera 3101.',
            },
            {
              year: '2007',
              title: 'Pastorado actual',
              description: 'Pr. Juan Olivera asume el pastorado principal de la congregación.',
            },
            {
              year: '2015',
              title: 'Diez ministerios',
              description: 'Se consolidan los ministerios de jóvenes, mujeres, niños y misiones.',
            },
            {
              year: 'Hoy',
              title: '2026 · 29 años',
              description: 'Una comunidad estable, intergeneracional y abierta a la ciudad.',
              isCurrent: true,
            },
          ],
        },
        {
          type: 'pullquote',
          quote:
            'Una iglesia local no se mide por lo que sucede una mañana de domingo, sino por lo que sostiene mil lunes seguidos.',
          cite: '— Pr. Juan Olivera, sermón aniversario 2024',
        },
        {
          type: 'figure',
          figure: {
            src: '/images/aboutus.jpg',
            alt: 'Congregación de la Iglesia Bautista El Ancla al cierre del culto dominical',
            label: '[ FIG.02 ]',
            caption: 'La congregación al cierre del culto dominical · 2024.',
            aspect: 'landscape',
          },
        },
      ],
    },
    {
      id: 'equipo',
      eyebrow: '04 — Equipo',
      tocLabel: 'Equipo pastoral',
      title: { before: 'Quienes pastorean ', emphasis: 'la casa.' },
      description:
        'El liderazgo de la iglesia está formado por un equipo plural, que comparte la enseñanza, la oración y el cuidado pastoral de la congregación.',
      blocks: [
        {
          type: 'team',
          people: [
            {
              initials: 'JO',
              role: 'Pastor principal',
              name: 'Pr. Juan Olivera',
              bio: 'En el pastorado desde 2007. Lleva la predicación dominical y la serie expositiva de Hebreos.',
            },
            {
              initials: 'MR',
              role: 'Pastor asociado',
              name: 'Pr. Martín Recalde',
              bio: 'Coordina la enseñanza, los grupos de crecimiento y el discipulado a nuevos creyentes.',
              tint: '#e6e2d6',
            },
            {
              initials: 'SP',
              role: 'Anciano',
              name: 'Sebastián Pérez',
              bio: 'Acompaña la pastoral de hombres y supervisa el ministerio de misiones locales.',
              tint: '#ece6da',
            },
            {
              initials: 'CV',
              role: 'Diaconisa',
              name: 'Carolina Vidal',
              bio: 'Lidera Espacio Mujer y la red de hospitalidad y cuidado de la congregación.',
              tint: '#efe9dc',
            },
            {
              initials: 'DA',
              role: 'Diácono',
              name: 'Diego Acosta',
              bio: 'Coordina los aspectos de logística, finanzas y servicio dominical de la iglesia.',
              tint: '#e9e4d6',
            },
            {
              initials: 'LN',
              role: 'Líder de jóvenes',
              name: 'Lucía Núñez',
              bio: 'Acompaña al ministerio de adolescentes y jóvenes y la formación bíblica de menores de 25.',
              tint: '#ece5d4',
            },
          ],
        },
      ],
    },
    {
      id: 'enlaces',
      eyebrow: '05 — Para seguir',
      tocLabel: 'Para seguir',
      title: { before: 'Si querés ', emphasis: 'seguir conociéndonos.' },
      description:
        'Algunos enlaces internos y recursos para profundizar en lo que somos, lo que creemos y lo que hacemos durante la semana.',
      blocks: [
        {
          type: 'linkGrid',
          links: [
            {
              href: '/confesion-de-fe',
              sourceLabel: 'elancla.uy / confesion',
              title: 'Confesión de Fe — doce artículos',
              description:
                'El detalle largo de nuestras convicciones doctrinales sobre Dios, la Escritura, el evangelio y la iglesia.',
              meta: 'Leer · 12 artículos',
              glyph: 'C',
            },
            {
              href: '/#ministerios',
              sourceLabel: 'elancla.uy / ministerios',
              title: 'Diez ministerios donde servir',
              description:
                'Cada ministerio es una invitación: un lugar para crecer, usar tus dones y servir a otros en nombre de Cristo.',
              meta: 'Ver listado completo',
              glyph: 'M',
              tint: '#e6e2d4',
            },
            {
              href: '/blog',
              sourceLabel: 'elancla.uy / blog',
              title: 'Blog · reflexiones y notas pastorales',
              description:
                'Una bitácora semanal con sermones, lecturas guiadas y notas breves sobre la vida en la iglesia.',
              meta: 'Cada martes · 7 min',
              glyph: 'B',
              tint: '#ece5d2',
            },
            {
              href: 'https://youtube.com/@iglesiaelanclauy',
              sourceLabel: 'youtube · @iglesiaelanclauy',
              title: 'Sermones en video',
              description:
                'El archivo completo de sermones dominicales y eventos especiales, transmitidos en vivo cada domingo.',
              meta: 'Abrir canal',
              glyph: 'Y',
              external: true,
              tint: '#efe7d4',
            },
          ],
        },
      ],
    },
  ],
  cta: {
    eyebrow: '[ Próximo paso ]',
    title: { before: 'Lo mejor es ', emphasis: 'venir.' },
    body: 'Conocer una iglesia se hace caminando hasta ella un domingo a la mañana. Te esperamos a las 11:15 hs en Av. Dr. Luis A. de Herrera 3101. Sin códigos, sin requisitos.',
    primary: {
      label: 'Cómo llegar',
      href: '/#visitanos',
    },
    secondary: {
      label: 'Ver horarios de la semana',
      href: '/#actividades',
    },
  },
};

const ministryDescriptions: Record<string, string> = {
  predicacion: 'La Palabra, expuesta fielmente',
  servicio: 'Manos que cuidan',
  ensenanza: 'Crecer en entendimiento',
  misiones: 'Al fin del mundo',
  adolescentes: 'Raíces en la adolescencia',
  jovenes: 'Una generación para Cristo',
  hombres: 'Discipulado entre varones',
  multimedia: 'Contar la historia',
  alabanza: 'Cantar con entendimiento',
};

function normalizeSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugFromMinistryUrl(url: string): string {
  return url.replace(/^\/ministerios\//, '').replace(/^\/|\/$/g, '');
}

function buildMinistryPages(): ContentPage[] {
  return ministriesData
    .filter((ministry) => ministry.url.startsWith('/ministerios/'))
    .map((ministry, index) => {
      const rawSlug = slugFromMinistryUrl(ministry.url);
      const slug = normalizeSlug(rawSlug);
      const summary = ministryDescriptions[slug] ?? 'Un espacio para crecer y servir juntos';
      const sectionNumber = String(index + 1).padStart(2, '0');

      return {
        routeGroup: 'ministerios',
        slug,
        aliases: rawSlug !== slug ? [rawSlug] : undefined,
        title: ministry.name,
        seoTitle: `${ministry.name} | Ministerios | El Ancla`,
        description: `${ministry.name}: ${summary.toLowerCase()} en Iglesia Bautista El Ancla.`,
        hero: {
          breadcrumbs: [
            { label: 'El Ancla', href: '/' },
            { label: 'Ministerios', href: '/#ministerios' },
            { label: ministry.name },
          ],
          chip: 'Ministerio',
          meta: [`Sec. ${sectionNumber} / ${ministry.name}`, 'Montevideo · UY'],
          titleLines: [
            { text: ministry.name },
            { before: 'en ', emphasis: 'El Ancla.' },
          ],
          standfirst:
            'Cada ministerio es una invitación: un lugar para crecer, usar tus dones y servir a otros en nombre de Cristo.',
        },
        featuredImage: {
          src: '/images/homebanner.jpeg',
          alt: `Ministerio ${ministry.name} de Iglesia Bautista El Ancla`,
          label: '[ MINISTERIO ]',
          caption: `${ministry.name} · ${summary}.`,
          badge: summary,
          meta: '— Montevideo · UY',
          aspect: 'wide',
        },
        shortcuts: [
          { label: 'Todos los ministerios', href: '/#ministerios' },
          { label: 'Cómo visitarnos', href: '/#visitanos' },
          { label: 'Confesión de fe', href: '/confesion-de-fe' },
        ],
        sections: [
          {
            id: 'identidad',
            eyebrow: '01 — Ministerio',
            tocLabel: 'Sobre el ministerio',
            title: { before: `${ministry.name}: `, emphasis: summary.toLowerCase() },
            description:
              'Esta página usa el template editorial compartido para que cada ministerio pueda crecer con contenido propio sin duplicar estructura.',
            blocks: [
              {
                type: 'prose',
                paragraphs: [
                  `El ministerio de <strong>${ministry.name}</strong> existe para acompañar a la iglesia en una forma concreta de servicio. Hoy dejamos una base simple y ordenada para publicar su propósito, actividades, responsables y próximos pasos.`,
                  'La intención es que cada página de ministerio pueda evolucionar desde datos tipados: se agrega contenido al registro y el template se encarga del diseño, el índice, las imágenes, los enlaces y la experiencia móvil.',
                ],
              },
              {
                type: 'values',
                values: [
                  {
                    number: 'I.',
                    title: 'Crecer',
                    description: 'Formar personas arraigadas en Cristo y en la Palabra.',
                  },
                  {
                    number: 'II.',
                    title: 'Servir',
                    description: 'Usar dones concretos para cuidar y edificar a la iglesia.',
                  },
                  {
                    number: 'III.',
                    title: 'Acompañar',
                    description: 'Caminar con otros con hospitalidad, oración y perseverancia.',
                  },
                ],
              },
            ],
          },
          {
            id: 'siguiente-paso',
            eyebrow: '02 — Próximo paso',
            tocLabel: 'Para conectar',
            title: { before: 'Un lugar para ', emphasis: 'servir juntos.' },
            blocks: [
              {
                type: 'linkGrid',
                links: [
                  {
                    href: '/#ministerios',
                    sourceLabel: 'elancla.uy / ministerios',
                    title: 'Volver al listado de ministerios',
                    description: 'Explorá los demás espacios de servicio y crecimiento de la iglesia.',
                    meta: 'Ver ministerios',
                    glyph: 'M',
                  },
                  {
                    href: '/#visitanos',
                    sourceLabel: 'elancla.uy / visitanos',
                    title: 'Conocernos un domingo',
                    description: 'La mejor forma de conectar con un ministerio es venir y conversar después del culto.',
                    meta: 'Domingos · 11:15',
                    glyph: 'V',
                    tint: '#e6e2d4',
                  },
                ],
              },
            ],
          },
        ],
        cta: {
          eyebrow: '[ Conectar ]',
          title: { before: 'Sumate a ', emphasis: `${ministry.name}.` },
          body: 'Si querés conocer más sobre este ministerio, visitanos un domingo o escribinos desde los canales de contacto de la iglesia.',
          primary: {
            label: 'Cómo llegar',
            href: '/#visitanos',
          },
          secondary: {
            label: 'Ver ministerios',
            href: '/#ministerios',
          },
        },
      } satisfies ContentPage;
    });
}

export const contentPages = [nosotrosPage, ...buildMinistryPages()] satisfies ContentPage[];

export function getContentPagesByRouteGroup(routeGroup: ContentPageRouteGroup): ContentPage[] {
  return contentPages.filter((page) => page.routeGroup === routeGroup);
}

export function getContentPageStaticPaths(routeGroup: ContentPageRouteGroup) {
  return getContentPagesByRouteGroup(routeGroup).flatMap((page) =>
    [page.slug, ...(page.aliases ?? [])].map((slug) => ({
      params: { slug },
      props: { page },
    }))
  );
}
