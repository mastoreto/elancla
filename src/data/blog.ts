export interface BlogAuthor {
  name: string;
  role: string;
  initials: string;
  bio: string;
  articleCount: number;
  stats?: {
    label: string;
    value: string;
  }[];
}

export interface BlogArticleLink {
  title: string;
  description: string;
  href: string;
  sourceLabel: string;
  meta: string;
  glyph: string;
}

export type BlogArticleBodyBlock =
  | {
      type: 'paragraph';
      html: string;
      dropCap?: boolean;
    }
  | {
      type: 'heading';
      id?: string;
      level: 2 | 3;
      eyebrow?: string;
      text: string;
      tocLabel?: string;
    }
  | {
      type: 'verse';
      reference: string;
      text: string;
    }
  | {
      type: 'figure';
      label: string;
      caption: string;
      glyph: string;
      aspect?: 'landscape' | 'wide' | 'square';
      tint?: string;
    }
  | {
      type: 'pullquote';
      quote: string;
      cite?: string;
    }
  | {
      type: 'list';
      ordered?: boolean;
      items: string[];
    }
  | {
      type: 'video';
      title: string;
      eyebrow: string;
      meta: string;
      duration: string;
      caption: string;
    }
  | {
      type: 'note';
      label: string;
      html: string;
    }
  | {
      type: 'links';
      links: BlogArticleLink[];
    }
  | {
      type: 'divider';
    }
  | {
      type: 'tags';
      tags: string[];
    }
  | {
      type: 'reactions';
      prompt: string;
      reactions: {
        id: string;
        label: string;
        icon: string;
        count: number;
      }[];
    };

export interface BlogArticle {
  slug: string;
  year: string;
  month: string;
  day: string;
  issue: string;
  title: string;
  seoTitle?: string;
  description: string;
  excerpt: string;
  category: string;
  filter: string;
  publishedAt: string;
  displayDate: string;
  compactDate: string;
  readTime: string;
  wordCount: string;
  author: BlogAuthor;
  featured?: boolean;
  coverGlyph: string;
  coverLabel: string;
  coverCaption: string;
  tint: string;
  accent: string;
  tags: string[];
  relatedSlugs: string[];
  body: BlogArticleBodyBlock[];
}

export interface BlogCategory {
  number: string;
  name: string;
  filter: string;
  count: number;
  blurb: string;
  featured?: boolean;
}

export interface BlogSeriesItem {
  number: string;
  title: string;
  reference: string;
  date: string;
  readTime: string;
  status: 'published' | 'current' | 'next';
  href: string;
}

export interface BlogArchiveItem {
  label: string;
  count: number;
}

export interface BlogPopularItem {
  article: BlogArticle;
  reads: string;
}

const juanOlivera: BlogAuthor = {
  name: 'Pr. Juan Olivera',
  role: 'Pastor principal',
  initials: 'JO',
  articleCount: 17,
  bio: 'Pastor principal de la Iglesia Bautista El Ancla desde 2007. Lleva adelante la serie expositiva de Hebreos junto a reflexiones sobre la vida de la iglesia y la fe en lo cotidiano.',
  stats: [
    { value: '17', label: 'Artículos' },
    { value: '19', label: 'Años pastor' },
    { value: '5', label: 'Series' },
    { value: '∞', label: 'Cafés' },
  ],
};

const authors = {
  juan: juanOlivera,
  vanesa: {
    name: 'Vanesa Ramírez',
    role: 'Equipo pastoral',
    initials: 'VR',
    articleCount: 8,
    bio: 'Acompaña áreas de discipulado y familia, con una mirada pastoral sobre la vida cotidiana de la iglesia.',
  },
  sebastian: {
    name: 'Sebastián Núñez',
    role: 'Ministerio de hombres',
    initials: 'SN',
    articleCount: 5,
    bio: 'Sirve en el acompañamiento de hombres y escribe crónicas de la vida comunitaria.',
  },
  lucia: {
    name: 'Lucía Pereira',
    role: 'Equipo editorial',
    initials: 'LP',
    articleCount: 6,
    bio: 'Escribe sobre cultura, descanso y formación cristiana desde una perspectiva pastoral.',
  },
  diego: {
    name: 'Diego Lemos',
    role: 'Ministerio de adolescentes',
    initials: 'DL',
    articleCount: 4,
    bio: 'Acompaña adolescentes y familias en conversaciones sobre fe, hábitos y comunidad.',
  },
  editorial: {
    name: 'Equipo editorial',
    role: 'Iglesia Bautista El Ancla',
    initials: 'EA',
    articleCount: 21,
    bio: 'Un equipo de miembros que recoge historias, testimonios y recursos para servir a la iglesia.',
  },
} satisfies Record<string, BlogAuthor>;

const fullArticleBody: BlogArticleBodyBlock[] = [
  {
    type: 'paragraph',
    dropCap: true,
    html: 'Hay textos del Nuevo Testamento que uno lee, asiente y olvida. Y hay otros que se quedan dando vueltas como una imagen vista al pasar por la calle. <strong>Hebreos 6:19</strong> es de los segundos. El autor no escribe un párrafo doctrinal: dibuja una escena. La esperanza, dice, es como un ancla. Y entonces uno levanta la vista y mira el mar de otro modo.',
  },
  {
    type: 'heading',
    level: 2,
    id: 's1',
    eyebrow: '01 - Texto',
    text: 'Una imagen marina',
  },
  {
    type: 'paragraph',
    html: 'El autor de Hebreos escribe a una comunidad cansada. Han pasado los primeros años de entusiasmo, las amistades se han desgastado, algunos se han ido. La fe ya no se siente como un viento a favor; se siente más bien como una marea que sube y baja sin pedir permiso. Es a esa iglesia, no a otra, a la que se le habla de un ancla.',
  },
  {
    type: 'verse',
    reference: 'Hebreos 6 · 19-20',
    text: 'La cual tenemos como segura y firme ancla del alma, y que penetra hasta dentro del velo, donde Jesús entró por nosotros como precursor.',
  },
  {
    type: 'paragraph',
    html: 'Lo importante no es solo el ancla. Es <em>dónde</em> está clavada. El autor no se conforma con una metáfora náutica: la lleva al santuario. El ancla atraviesa el velo y se afirma en la presencia misma de Dios.',
  },
  {
    type: 'figure',
    label: '[ FIG.02 ]',
    caption: 'Detalle del puerto de Montevideo · placeholder de imagen.',
    glyph: '~',
    aspect: 'landscape',
    tint: '#efebe3',
  },
  {
    type: 'heading',
    level: 2,
    id: 's2',
    eyebrow: '02 - Imagen',
    text: '¿Por qué un ancla?',
  },
  {
    type: 'paragraph',
    html: 'Las anclas tienen dos características fáciles de pasar por alto. Primero: no se ven. Cuando un barco está bien anclado, lo único que se nota es que <em>no se mueve</em>. La estabilidad del barco no proviene de algo que el barco hace, sino de algo que ya está hecho debajo, en lo invisible.',
  },
  {
    type: 'list',
    items: [
      '<strong>El ancla trabaja debajo.</strong> Lo que sostiene a la iglesia rara vez es lo que se ve por afuera.',
      '<strong>El ancla trabaja sola.</strong> No necesita que el barco la ayude; necesita que el barco confíe en ella.',
      '<strong>El ancla se prueba en la tormenta.</strong> En la calma todo parece firme; el ancla se descubre cuando el viento sopla en contra.',
    ],
  },
  {
    type: 'pullquote',
    quote:
      'No estamos llamados a producir la esperanza. Estamos llamados a recordarla, a confiar en ella, y a vivir como si fuera verdad.',
    cite: 'Notas del sermón, 13 · ABR · 2026',
  },
  {
    type: 'paragraph',
    html: 'Hay una segunda imagen que el texto no nombra pero que está implícita: el barco se mueve igual. El ancla no detiene la marea, no calma el viento, no aplana el oleaje. Lo que hace es <em>fijar el centro</em>.',
  },
  {
    type: 'heading',
    level: 3,
    text: 'El sermón completo, en video',
  },
  {
    type: 'paragraph',
    html: 'Si querés ver el desarrollo completo del texto, el sermón del domingo pasado está disponible en YouTube. Acompaña con notas y referencias cruzadas a Romanos 5 y 1 Pedro 1.',
  },
  {
    type: 'video',
    title: 'El ancla del alma - Heb. 6',
    eyebrow: 'Sermón · 21 · ABR · 2026',
    meta: 'YouTube',
    duration: '42:18',
    caption: 'Predicado por Pr. Juan Olivera · Iglesia Bautista El Ancla.',
  },
  {
    type: 'heading',
    level: 2,
    id: 's3',
    eyebrow: '03 - Aplicación',
    text: 'La esperanza que no avergüenza',
  },
  {
    type: 'paragraph',
    html: 'Pablo escribirá algo parecido en <a href="#">Romanos 5:5</a>: la esperanza no avergüenza. La frase es sorprendente porque sugiere que <em>algunas</em> esperanzas sí avergüenzan. La esperanza puesta en uno mismo, en un proyecto o en un ciclo económico, tarde o temprano deja en evidencia.',
  },
  {
    type: 'paragraph',
    html: 'La esperanza cristiana es de otro orden. No promete que el mar se calme; promete que el ancla aguanta. Y eso, en una época en la que casi todo se mide por resultados visibles, es una palabra profundamente contracultural.',
  },
  {
    type: 'note',
    label: 'Nota · Glosario',
    html: '<strong>Elpis.</strong> En griego, esperanza no es un deseo incierto sino una expectativa fundada. No es “ojalá pase” sino “estoy seguro de que pasará”.',
  },
  {
    type: 'heading',
    level: 2,
    id: 's4',
    eyebrow: '04 - Práctica',
    text: 'Tres prácticas para esta semana',
  },
  {
    type: 'paragraph',
    html: 'No alcanza con asentir a una imagen. La fe se cultiva en prácticas pequeñas, repetidas, casi aburridas. Aquí van tres propuestas concretas para esta semana.',
  },
  {
    type: 'list',
    ordered: true,
    items: [
      '<strong>Lectura diaria.</strong> Leé en voz alta Hebreos 6:13-20 cada mañana, durante siete días.',
      '<strong>Una conversación.</strong> Compartí con alguien de la iglesia una situación en la que sentís que el ancla está siendo probada.',
      '<strong>Una memoria.</strong> Aprendé el versículo 19 de memoria. Una semana, un versículo, una vida.',
    ],
  },
  {
    type: 'heading',
    level: 3,
    text: 'Para seguir leyendo',
  },
  {
    type: 'paragraph',
    html: 'Algunas lecturas externas pueden ayudarte a profundizar el tema. No son ortodoxia obligatoria; son compañeros de camino.',
  },
  {
    type: 'links',
    links: [
      {
        title: 'El ancla que sostiene en cualquier tormenta',
        description:
          'Una meditación sobre Hebreos 6:19 y el carácter inquebrantable de la promesa de Dios.',
        href: '#',
        sourceLabel: 'desiringgod.org',
        meta: 'Leer artículo · 8 min',
        glyph: 'H',
      },
      {
        title: 'La iglesia local como hogar de la esperanza',
        description:
          'Reflexiones desde el pastorado sobre esperanza cristiana en la vida ordinaria de una congregación.',
        href: '#',
        sourceLabel: '9marks.org',
        meta: 'Leer artículo · 12 min',
        glyph: 'R',
      },
    ],
  },
  { type: 'divider' },
  {
    type: 'heading',
    level: 2,
    id: 's5',
    eyebrow: '05 - Cierre',
    text: 'Para meditar en familia',
  },
  {
    type: 'paragraph',
    html: 'Tres preguntas para conversar con tu cónyuge, con tus hijos, en tu grupo de crecimiento, o con el café del lunes a la mañana.',
  },
  {
    type: 'list',
    items: [
      '¿Dónde estoy poniendo, hoy, el peso de mi esperanza?',
      '¿Qué tormentas están sacudiendo a alguien cerca mío que necesita que le recuerde el ancla?',
      '¿Qué cambia en mi semana si tomo este texto en serio?',
    ],
  },
  {
    type: 'paragraph',
    html: 'El próximo martes vamos a continuar la serie con un estudio sobre el sacerdocio de Cristo según Hebreos 7. Hasta entonces, que el ancla aguante.',
  },
  {
    type: 'tags',
    tags: ['Esperanza', 'Hebreos', 'Reflexión', 'Pastoral', 'Domingo'],
  },
  {
    type: 'reactions',
    prompt: 'Marcá una reacción.',
    reactions: [
      { id: 'amen', label: 'Amén', icon: '+', count: 128 },
      { id: 'meditar', label: 'Para meditar', icon: '◐', count: 42 },
      { id: 'gracias', label: 'Gracias', icon: 'o', count: 73 },
      { id: 'orare', label: 'Oraré', icon: '•', count: 31 },
    ],
  },
];

const seedBody = (
  title: string,
  excerpt: string,
  category: string,
  tags: string[]
): BlogArticleBodyBlock[] => [
  {
    type: 'paragraph',
    dropCap: true,
    html: `${excerpt} Esta página funciona como una semilla editorial para el blog: recoge el resumen, la línea pastoral principal y preguntas útiles para que el artículo pueda publicarse dentro de la nueva experiencia mientras se completa su desarrollo final.`,
  },
  {
    type: 'heading',
    level: 2,
    id: 's1',
    eyebrow: '01 - Enfoque',
    text: 'El hilo principal',
  },
  {
    type: 'paragraph',
    html: `Este recurso pertenece a la categoría <strong>${category}</strong> y busca conectar la enseñanza bíblica con la vida ordinaria de la iglesia. La intención es que ${title.toLowerCase()} sirva como punto de partida para conversar, orar y mirar la semana con más claridad.`,
  },
  {
    type: 'verse',
    reference: 'Hebreos 6 · 19',
    text: 'Tenemos esta esperanza como firme y segura ancla del alma.',
  },
  {
    type: 'heading',
    level: 2,
    id: 's2',
    eyebrow: '02 - Aplicación',
    text: 'Preguntas para conversar',
  },
  {
    type: 'list',
    items: [
      '¿Qué parte de este tema toca una situación concreta de tu semana?',
      '¿Qué promesa del evangelio necesitás recordar antes de actuar?',
      '¿Con quién podrías conversar u orar a partir de esta lectura?',
    ],
  },
  {
    type: 'note',
    label: 'Nota editorial',
    html: 'Este artículo está preparado como página semilla. Conserva la ruta, metadata y estructura visual definitiva para que pueda completarse sin cambiar enlaces públicos.',
  },
  {
    type: 'tags',
    tags,
  },
  {
    type: 'reactions',
    prompt: 'Marcá una reacción.',
    reactions: [
      { id: 'amen', label: 'Amén', icon: '+', count: 18 },
      { id: 'meditar', label: 'Para meditar', icon: '◐', count: 9 },
      { id: 'gracias', label: 'Gracias', icon: 'o', count: 12 },
    ],
  },
];

export const blogArticles: BlogArticle[] = [
  {
    slug: 'el-ancla-del-alma-una-esperanza-que-no-averguenza',
    year: '2026',
    month: '04',
    day: '21',
    issue: 'N. 042',
    title: 'El ancla del alma: una esperanza que no avergüenza.',
    seoTitle: 'El ancla del alma | Blog Iglesia Bautista El Ancla',
    description:
      'Una reflexión desde Hebreos 6:19 sobre la esperanza cristiana como ancla firme del alma.',
    excerpt:
      'Hebreos 6:19 nos da una imagen poderosa: la esperanza del evangelio es como un ancla del alma, firme y segura.',
    category: 'Reflexión',
    filter: 'reflexion',
    publishedAt: '2026-04-21',
    displayDate: '21 · ABR · 2026',
    compactDate: '21 · ABR',
    readTime: '9 min',
    wordCount: '2 · 540 palabras',
    author: authors.juan,
    featured: true,
    coverGlyph: 'esperanza',
    coverLabel: '[ portada ]',
    coverCaption: 'Foto: placeholder · El puerto al amanecer, frente al Río de la Plata.',
    tint: '#efebe3',
    accent: 'rgba(255, 46, 52, 0.2)',
    tags: ['Esperanza', 'Hebreos', 'Reflexión', 'Pastoral', 'Domingo'],
    relatedSlugs: [
      'hebreos-6-una-esperanza-mas-firme-que-el-ancla',
      'lo-pequeno-tambien-predica',
      'salmo-90-aprender-a-contar-nuestros-dias',
    ],
    body: fullArticleBody,
  },
  {
    slug: 'esperar-bien-iglesia-impaciente',
    year: '2026',
    month: '04',
    day: '18',
    issue: 'N. 041',
    title: 'Esperar bien: lecciones para una iglesia impaciente',
    description:
      'Una meditación pastoral sobre la paciencia cristiana cuando Dios parece trabajar más lento que nuestros planes.',
    excerpt:
      'La paciencia no es una virtud sentimental. Es la forma en que la fe respira mientras Dios trabaja.',
    category: 'Reflexión',
    filter: 'reflexion',
    publishedAt: '2026-04-18',
    displayDate: '18 · ABR · 2026',
    compactDate: '18 · ABR',
    readTime: '7 min',
    wordCount: '1 · 850 palabras',
    author: authors.juan,
    coverGlyph: 'EB',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Esperar bien en comunidad.',
    tint: '#f0e9dd',
    accent: 'rgba(255, 46, 52, 0.2)',
    tags: ['Paciencia', 'Reflexión', 'Iglesia'],
    relatedSlugs: ['el-ancla-del-alma-una-esperanza-que-no-averguenza'],
    body: seedBody(
      'Esperar bien: lecciones para una iglesia impaciente',
      'La paciencia no es una virtud sentimental. Es la forma en que la fe respira mientras Dios trabaja.',
      'Reflexión',
      ['Paciencia', 'Reflexión', 'Iglesia']
    ),
  },
  {
    slug: 'hebreos-6-una-esperanza-mas-firme-que-el-ancla',
    year: '2026',
    month: '04',
    day: '16',
    issue: 'N. 040',
    title: 'Hebreos 6 - Una esperanza más firme que el ancla.',
    description:
      'Tercera entrega de la serie expositiva de Hebreos, con notas, citas y preguntas para conversar.',
    excerpt:
      'Tercera entrega de la serie expositiva. Notas, citas y preguntas para conversar.',
    category: 'Estudio',
    filter: 'estudio',
    publishedAt: '2026-04-16',
    displayDate: '16 · ABR · 2026',
    compactDate: '16 · ABR',
    readTime: '11 min',
    wordCount: '2 · 900 palabras',
    author: authors.juan,
    coverGlyph: 'H6',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Serie Hebreos.',
    tint: '#e6e4dd',
    accent: 'rgba(20, 20, 20, 0.18)',
    tags: ['Hebreos', 'Estudio', 'Esperanza'],
    relatedSlugs: ['el-ancla-del-alma-una-esperanza-que-no-averguenza'],
    body: seedBody(
      'Hebreos 6 - Una esperanza más firme que el ancla.',
      'Tercera entrega de la serie expositiva. Notas, citas y preguntas para conversar.',
      'Estudio',
      ['Hebreos', 'Estudio', 'Esperanza']
    ),
  },
  {
    slug: 'una-mesa-un-evangelio-comer-juntos',
    year: '2026',
    month: '04',
    day: '14',
    issue: 'N. 039',
    title: 'Una mesa, un evangelio: comer juntos como acto pastoral.',
    description:
      'Una reflexión sobre la mesa, la hospitalidad y la formación espiritual en la vida doméstica.',
    excerpt:
      'Lo que se construye sobre la mesa de la cocina suele ser más fuerte que lo que se dice desde el púlpito.',
    category: 'Familia',
    filter: 'familia',
    publishedAt: '2026-04-14',
    displayDate: '14 · ABR · 2026',
    compactDate: '14 · ABR',
    readTime: '6 min',
    wordCount: '1 · 520 palabras',
    author: authors.vanesa,
    coverGlyph: 'ME',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Mesa y hospitalidad.',
    tint: '#e9e2d4',
    accent: 'rgba(255, 46, 52, 0.18)',
    tags: ['Familia', 'Hospitalidad', 'Discipulado'],
    relatedSlugs: ['adolescentes-pantallas-y-la-voz-que-falta'],
    body: seedBody(
      'Una mesa, un evangelio: comer juntos como acto pastoral.',
      'Lo que se construye sobre la mesa de la cocina suele ser más fuerte que lo que se dice desde el púlpito.',
      'Familia',
      ['Familia', 'Hospitalidad', 'Discipulado']
    ),
  },
  {
    slug: 'cronica-retiro-hombres-lavalleja',
    year: '2026',
    month: '04',
    day: '11',
    issue: 'N. 038',
    title: 'Crónica del retiro de hombres en Lavalleja.',
    description:
      'Tres días de enseñanza, comunión y conversaciones necesarias para el ministerio de hombres.',
    excerpt:
      'Tres días, dos sermones, una guitarra rota y muchas conversaciones que necesitábamos.',
    category: 'Iglesia',
    filter: 'iglesia',
    publishedAt: '2026-04-11',
    displayDate: '11 · ABR · 2026',
    compactDate: '11 · ABR',
    readTime: '5 min',
    wordCount: '1 · 250 palabras',
    author: authors.sebastian,
    coverGlyph: 'RH',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Retiro de hombres.',
    tint: '#f0e9dd',
    accent: 'rgba(255, 46, 52, 0.2)',
    tags: ['Iglesia', 'Hombres', 'Comunidad'],
    relatedSlugs: ['bautismos-de-otono-tres-testimonios'],
    body: seedBody(
      'Crónica del retiro de hombres en Lavalleja.',
      'Tres días, dos sermones, una guitarra rota y muchas conversaciones que necesitábamos.',
      'Iglesia',
      ['Iglesia', 'Hombres', 'Comunidad']
    ),
  },
  {
    slug: 'cansancio-diagnostico-espiritual',
    year: '2026',
    month: '04',
    day: '08',
    issue: 'N. 037',
    title: 'El cansancio como diagnóstico espiritual.',
    description:
      'Una lectura pastoral sobre descanso, límites y vida cristiana cuando la agenda se vuelve liturgia.',
    excerpt:
      'No siempre tenemos un problema teológico. A veces solo necesitamos dormir, descansar y oír.',
    category: 'Cultura',
    filter: 'cultura',
    publishedAt: '2026-04-08',
    displayDate: '08 · ABR · 2026',
    compactDate: '08 · ABR',
    readTime: '8 min',
    wordCount: '1 · 980 palabras',
    author: authors.lucia,
    coverGlyph: 'CE',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Descanso y cultura.',
    tint: '#e6e4dd',
    accent: 'rgba(20, 20, 20, 0.18)',
    tags: ['Cultura', 'Descanso', 'Sabiduría'],
    relatedSlugs: ['salmo-90-aprender-a-contar-nuestros-dias'],
    body: seedBody(
      'El cansancio como diagnóstico espiritual.',
      'No siempre tenemos un problema teológico. A veces solo necesitamos dormir, descansar y oír.',
      'Cultura',
      ['Cultura', 'Descanso', 'Sabiduría']
    ),
  },
  {
    slug: 'lo-pequeno-tambien-predica',
    year: '2026',
    month: '04',
    day: '05',
    issue: 'N. 036',
    title: 'Lo pequeño también predica.',
    description:
      'Cómo los gestos cotidianos forman el carácter de una iglesia que espera y sirve.',
    excerpt:
      'Cómo los gestos cotidianos forman el carácter de una iglesia que espera y sirve.',
    category: 'Reflexión',
    filter: 'reflexion',
    publishedAt: '2026-04-05',
    displayDate: '05 · ABR · 2026',
    compactDate: '05 · ABR',
    readTime: '4 min',
    wordCount: '920 palabras',
    author: authors.juan,
    coverGlyph: 'LP',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Gestos cotidianos.',
    tint: '#e9e2d4',
    accent: 'rgba(255, 46, 52, 0.18)',
    tags: ['Reflexión', 'Servicio', 'Iglesia'],
    relatedSlugs: ['el-ancla-del-alma-una-esperanza-que-no-averguenza'],
    body: seedBody(
      'Lo pequeño también predica.',
      'Cómo los gestos cotidianos forman el carácter de una iglesia que espera y sirve.',
      'Reflexión',
      ['Reflexión', 'Servicio', 'Iglesia']
    ),
  },
  {
    slug: 'salmo-90-aprender-a-contar-nuestros-dias',
    year: '2026',
    month: '04',
    day: '02',
    issue: 'N. 035',
    title: 'Salmo 90: aprender a contar nuestros días.',
    description:
      'Una meditación pastoral sobre la finitud, la rutina y la gracia que sostiene cada amanecer.',
    excerpt:
      'Una meditación pastoral sobre la finitud, la rutina y la gracia que sostiene cada amanecer.',
    category: 'Estudio',
    filter: 'estudio',
    publishedAt: '2026-04-02',
    displayDate: '02 · ABR · 2026',
    compactDate: '02 · ABR',
    readTime: '9 min',
    wordCount: '2 · 100 palabras',
    author: authors.juan,
    coverGlyph: 'S90',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Salmo 90.',
    tint: '#f0e9dd',
    accent: 'rgba(255, 46, 52, 0.2)',
    tags: ['Salmos', 'Estudio', 'Gracia'],
    relatedSlugs: ['cansancio-diagnostico-espiritual'],
    body: seedBody(
      'Salmo 90: aprender a contar nuestros días.',
      'Una meditación pastoral sobre la finitud, la rutina y la gracia que sostiene cada amanecer.',
      'Estudio',
      ['Salmos', 'Estudio', 'Gracia']
    ),
  },
  {
    slug: 'adolescentes-pantallas-y-la-voz-que-falta',
    year: '2026',
    month: '03',
    day: '29',
    issue: 'N. 034',
    title: 'Adolescentes, pantallas y la voz que falta.',
    description:
      'Una conversación pastoral para familias que quieren acompañar a sus adolescentes sin miedo ni ingenuidad.',
    excerpt:
      'No estamos compitiendo con TikTok. Estamos compitiendo con el silencio en la mesa.',
    category: 'Familia',
    filter: 'familia',
    publishedAt: '2026-03-29',
    displayDate: '29 · MAR · 2026',
    compactDate: '29 · MAR',
    readTime: '7 min',
    wordCount: '1 · 740 palabras',
    author: authors.diego,
    coverGlyph: 'AP',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Adolescentes y pantallas.',
    tint: '#e9e2d4',
    accent: 'rgba(255, 46, 52, 0.18)',
    tags: ['Familia', 'Adolescentes', 'Crianza'],
    relatedSlugs: ['una-mesa-un-evangelio-comer-juntos'],
    body: seedBody(
      'Adolescentes, pantallas y la voz que falta.',
      'No estamos compitiendo con TikTok. Estamos compitiendo con el silencio en la mesa.',
      'Familia',
      ['Familia', 'Adolescentes', 'Crianza']
    ),
  },
  {
    slug: 'bautismos-de-otono-tres-testimonios',
    year: '2026',
    month: '03',
    day: '27',
    issue: 'N. 033',
    title: 'Bautismos de otoño: tres testimonios.',
    description:
      'Marcos, Cecilia y Joaquín cuentan cómo llegaron al agua y por qué quisieron entrar.',
    excerpt:
      'Marcos, Cecilia y Joaquín cuentan cómo llegaron al agua y por qué quisieron entrar.',
    category: 'Iglesia',
    filter: 'iglesia',
    publishedAt: '2026-03-27',
    displayDate: '27 · MAR · 2026',
    compactDate: '27 · MAR',
    readTime: '6 min',
    wordCount: '1 · 480 palabras',
    author: authors.editorial,
    coverGlyph: 'BO',
    coverLabel: '[ portada ]',
    coverCaption: 'Placeholder editorial · Bautismos de otoño.',
    tint: '#e6e4dd',
    accent: 'rgba(20, 20, 20, 0.18)',
    tags: ['Iglesia', 'Bautismos', 'Testimonios'],
    relatedSlugs: ['cronica-retiro-hombres-lavalleja'],
    body: seedBody(
      'Bautismos de otoño: tres testimonios.',
      'Marcos, Cecilia y Joaquín cuentan cómo llegaron al agua y por qué quisieron entrar.',
      'Iglesia',
      ['Iglesia', 'Bautismos', 'Testimonios']
    ),
  },
];

export const blogCategories: BlogCategory[] = [
  {
    number: '01',
    name: 'Reflexión',
    filter: 'reflexion',
    count: 38,
    blurb: 'Notas pastorales y devocionales para la semana.',
  },
  {
    number: '02',
    name: 'Estudio bíblico',
    filter: 'estudio',
    count: 27,
    blurb: 'Series expositivas y notas sobre los textos.',
  },
  {
    number: '03',
    name: 'Vida de iglesia',
    filter: 'iglesia',
    count: 22,
    blurb: 'Crónicas, anuncios y testimonios de la comunidad.',
  },
  {
    number: '04',
    name: 'Familia',
    filter: 'familia',
    count: 18,
    blurb: 'Crianza, matrimonio y la fe en casa.',
  },
  {
    number: '05',
    name: 'Cultura',
    filter: 'cultura',
    count: 14,
    blurb: 'El evangelio frente a las preguntas del momento.',
  },
  {
    number: '06',
    name: 'Misión',
    filter: 'mision',
    count: 12,
    blurb: 'Lo que hacemos dentro y fuera de Montevideo.',
  },
  {
    number: '07',
    name: 'Jóvenes',
    filter: 'jovenes',
    count: 11,
    blurb: 'Para adolescentes, universitarios y los que vienen.',
  },
  {
    number: '+',
    name: 'Archivo',
    filter: 'todos',
    count: 142,
    blurb: 'Todo lo publicado desde el principio.',
    featured: true,
  },
];

export const blogSeries: BlogSeriesItem[] = [
  {
    number: '01',
    title: 'El Hijo, mejor que los ángeles',
    reference: 'Heb. 1-2',
    date: '07 · MAR',
    readTime: '10 min',
    status: 'published',
    href: '/blog/2026/04/16/hebreos-6-una-esperanza-mas-firme-que-el-ancla',
  },
  {
    number: '02',
    title: 'Un descanso que nos espera',
    reference: 'Heb. 3-4',
    date: '21 · MAR',
    readTime: '9 min',
    status: 'published',
    href: '/blog/2026/04/16/hebreos-6-una-esperanza-mas-firme-que-el-ancla',
  },
  {
    number: '03',
    title: 'Una esperanza más firme',
    reference: 'Heb. 5-6',
    date: '16 · ABR',
    readTime: '11 min',
    status: 'current',
    href: '/blog/2026/04/16/hebreos-6-una-esperanza-mas-firme-que-el-ancla',
  },
  {
    number: '04',
    title: 'El sacerdote que necesitábamos',
    reference: 'Heb. 7-9',
    date: '08 · MAY',
    readTime: '-',
    status: 'next',
    href: '#newsletter',
  },
  {
    number: '05',
    title: 'Por la fe, y por la mira',
    reference: 'Heb. 10-13',
    date: '23 · MAY',
    readTime: '-',
    status: 'next',
    href: '#newsletter',
  },
];

export const blogTags = [
  'Gracia',
  'Oración',
  'Familia',
  'Hebreos',
  'Domingo',
  'Misión',
  'Discipulado',
  'Sufrimiento',
  'Comunidad',
  'Esperanza',
  'Lectura bíblica',
  'Adolescentes',
  'Predicación',
  'Cultura',
  'Identidad',
];

export const blogArchive: BlogArchiveItem[] = [
  { label: 'Abril 2026', count: 12 },
  { label: 'Marzo 2026', count: 9 },
  { label: 'Febrero 2026', count: 11 },
  { label: 'Enero 2026', count: 8 },
  { label: 'Diciembre 2025', count: 10 },
];

export const blogMarqueeItems = [
  'Reflexiones',
  'Estudios bíblicos',
  'Vida de iglesia',
  'Familia',
  'Misión',
  'Cultura',
];

export const blogNewsletter = {
  eyebrow: 'Cada martes · 7 minutos de lectura',
  title: 'Carta semanal al correo, sin ruido.',
  description:
    'Una nota corta del pastor, los artículos nuevos y un par de ideas para meditar a lo largo de la semana.',
  readers: '+ 480 lectores',
};

export const featuredArticle = blogArticles.find((article) => article.featured)
  ?? blogArticles[0];

export const blogPopularItems: BlogPopularItem[] = [
  { article: blogArticles[0], reads: '2.1k' },
  { article: blogArticles[2], reads: '1.7k' },
  { article: blogArticles[3], reads: '1.4k' },
  { article: blogArticles[5], reads: '1.2k' },
  { article: blogArticles[9], reads: '0.9k' },
];

export const getBlogArticlePath = (article: BlogArticle) =>
  `/blog/${article.year}/${article.month}/${article.day}/${article.slug}`;

export const getBlogArticleBySlug = (params: {
  year?: string;
  month?: string;
  day?: string;
  slug?: string;
}) =>
  blogArticles.find(
    (article) =>
      article.year === params.year &&
      article.month === params.month &&
      article.day === params.day &&
      article.slug === params.slug
  );

export const getArticleToc = (article: BlogArticle) =>
  article.body
    .filter(
      (
        block
      ): block is Extract<BlogArticleBodyBlock, { type: 'heading' }> =>
        block.type === 'heading' && block.level === 2 && Boolean(block.id)
    )
    .map((block, index) => ({
      id: block.id ?? '',
      label: block.tocLabel ?? block.text,
      number: String(index + 1).padStart(2, '0'),
    }));

export const getRelatedArticles = (article: BlogArticle, limit = 3) => {
  const explicit = article.relatedSlugs
    .map((slug) => blogArticles.find((candidate) => candidate.slug === slug))
    .filter(
      (candidate): candidate is BlogArticle =>
        candidate !== undefined && candidate.slug !== article.slug
    );

  const fallback = blogArticles.filter(
    (candidate) =>
      candidate.slug !== article.slug &&
      !explicit.some((item) => item.slug === candidate.slug) &&
      candidate.category === article.category
  );

  const remaining = blogArticles.filter(
    (candidate) =>
      candidate.slug !== article.slug &&
      !explicit.some((item) => item.slug === candidate.slug) &&
      !fallback.some((item) => item.slug === candidate.slug)
  );

  return [...explicit, ...fallback, ...remaining].slice(0, limit);
};

export const getPreviousNextArticles = (article: BlogArticle) => {
  const sorted = [...blogArticles].sort((a, b) =>
    a.publishedAt.localeCompare(b.publishedAt)
  );
  const index = sorted.findIndex((candidate) => candidate.slug === article.slug);

  return {
    previous: index > 0 ? sorted[index - 1] : null,
    next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
  };
};
