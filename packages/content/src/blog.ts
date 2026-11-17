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

// Guías pilar (respuestas directas a preguntas frecuentes sobre la fe). Redactadas a partir de la confesión de fe;
// requieren revisión pastoral antes de publicarse en producción.
const guideArticles: BlogArticle[] = [
  {
    slug: "que-es-la-fe-cristiana",
    year: "2026",
    month: "11",
    day: "17",
    issue: "N. 043",
    title: "¿Qué es la fe cristiana?",
    seoTitle: "¿Qué es la fe cristiana? Una guía sencilla",
    description:
      "Qué significa tener fe según la Biblia: confiar en Jesucristo, recibir la salvación por gracia y vivir a partir de esa confianza.",
    excerpt:
      "La fe cristiana no es un sentimiento ni un esfuerzo por ganarnos a Dios: es confiar en lo que él hizo por nosotros en Jesucristo.",
    category: "Estudio",
    filter: "estudio",
    publishedAt: "2026-11-17",
    displayDate: "17 · NOV · 2026",
    compactDate: "17 · NOV",
    readTime: "2 min",
    wordCount: "435 palabras",
    author: authors.editorial,
    coverGlyph: "FE",
    coverLabel: "[ guía ]",
    coverCaption: "Guía · Qué es la fe",
    tint: "#efebe3",
    accent: "rgba(255, 46, 52, 0.2)",
    tags: ["Fe", "Salvación", "Guía", "Biblia"],
    relatedSlugs: ["quien-es-dios-segun-la-biblia", "que-creen-los-bautistas"],
    body: [
      {
        type: "paragraph",
        html: "La fe cristiana es confiar en Dios y en lo que él hizo por nosotros en Jesucristo. No es un sentimiento ni un esfuerzo por ganarnos su favor: es recibir como regalo el perdón y la vida nueva que Dios promete, y vivir a partir de esa confianza.",
        dropCap: true,
      },
      {
        type: "heading",
        level: 2,
        id: "que-no-es",
        eyebrow: "01 - Aclarando",
        text: "Lo que la fe no es",
      },
      {
        type: "paragraph",
        html: 'Se suele hablar de fe como si fuera creer sin pruebas, tener una sensación positiva o "pensar que todo va a salir bien". La Biblia habla de otra cosa. La fe cristiana tiene un objeto concreto: una Persona, Jesucristo, y lo que ella hizo en la cruz y en la resurrección. No se sostiene en la intensidad de lo que sentimos, sino en la fidelidad de aquel en quien confiamos.',
      },
      {
        type: "heading",
        level: 2,
        id: "que-dice-la-biblia",
        eyebrow: "02 - Texto",
        text: "Qué dice la Biblia",
      },
      {
        type: "verse",
        reference: "Hebreos 11 · 1",
        text: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
      },
      {
        type: "paragraph",
        html: "El texto habla de certeza y de convicción, no de duda disfrazada. Quien tiene fe no ve todo con claridad, pero sabe en quién descansa. Por eso la fe no es lo contrario del pensamiento: se apoya en lo que Dios dijo en su Palabra.",
      },
      {
        type: "heading",
        level: 2,
        id: "por-gracia",
        eyebrow: "03 - Salvación",
        text: "Por gracia, por medio de la fe",
      },
      {
        type: "verse",
        reference: "Efesios 2 · 8-9",
        text: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.",
      },
      {
        type: "paragraph",
        html: "Aquí está el corazón del mensaje. La salvación no se gana con buenas obras ni con una vida ordenada; es un regalo de Dios. La fe es la mano abierta que lo recibe. Por eso, en la confesión de fe de esta iglesia, la salvación se describe como un regalo gratuito que incluye elección, justificación y santificación.",
      },
      {
        type: "pullquote",
        quote:
          "La fe no es la causa de la salvación: es la mano vacía que recibe el regalo.",
      },
      {
        type: "heading",
        level: 2,
        id: "como-se-vive",
        eyebrow: "04 - Vida",
        text: "Cómo se vive la fe",
      },
      {
        type: "paragraph",
        html: "La fe verdadera no se queda en una idea. Cambia la manera de vivir, no para ganar el amor de Dios sino porque ya fue recibido:",
      },
      {
        type: "list",
        items: [
          "<strong>Se ora.</strong> Hablamos con Dios porque confiamos en que nos escucha.",
          "<strong>Se lee la Biblia.</strong> Ahí Dios nos dice quién es y qué hizo.",
          "<strong>Se camina en comunidad.</strong> La fe no se vive sola; la iglesia existe para sostenernos.",
          "<strong>Se obedece.</strong> Con errores y con perdón, pero con ganas de agradar a Dios.",
        ],
      },
      {
        type: "heading",
        level: 2,
        id: "si-quieres-empezar",
        eyebrow: "05 - Un paso",
        text: "Si quieres empezar a conocerlo",
      },
      {
        type: "paragraph",
        html: 'No hace falta tener todo claro. Puedes empezar leyendo el Evangelio de Juan, hablando con alguien de confianza o visitándonos un domingo. En <a href="/visitanos">la página de visita</a> están los horarios y cómo llegar, y en la <a href="/confesion-de-fe">confesión de fe</a> explicamos con calma lo que creemos.',
      },
      { type: "tags", tags: ["Fe", "Salvación", "Guía", "Biblia"] },
    ],
  },
  {
    slug: "quien-es-dios-segun-la-biblia",
    year: "2026",
    month: "11",
    day: "17",
    issue: "N. 044",
    title: "¿Quién es Dios según la Biblia?",
    seoTitle: "¿Quién es Dios según la Biblia? Una guía sencilla",
    description:
      "Quién es Dios según la Biblia: el único Dios verdadero, Creador y soberano, que existe como Padre, Hijo y Espíritu Santo y se dio a conocer en Jesucristo.",
    excerpt:
      "La Biblia presenta a un solo Dios, Creador de todo, que existe como Padre, Hijo y Espíritu Santo y se dio a conocer plenamente en Jesús.",
    category: "Estudio",
    filter: "estudio",
    publishedAt: "2026-11-17",
    displayDate: "17 · NOV · 2026",
    compactDate: "17 · NOV",
    readTime: "2 min",
    wordCount: "397 palabras",
    author: authors.editorial,
    coverGlyph: "DIOS",
    coverLabel: "[ guía ]",
    coverCaption: "Guía · Quién es Dios",
    tint: "#efebe3",
    accent: "rgba(255, 46, 52, 0.2)",
    tags: ["Dios", "Trinidad", "Guía", "Biblia"],
    relatedSlugs: ["que-es-la-fe-cristiana", "que-creen-los-bautistas"],
    body: [
      {
        type: "paragraph",
        html: "Según la Biblia, Dios es el único Dios verdadero, Creador y soberano del universo. Existe eternamente como Padre, Hijo y Espíritu Santo, tres Personas iguales en esencia, poder y gloria, y se ha dado a conocer en la Escritura y, de manera plena, en Jesucristo.",
        dropCap: true,
      },
      {
        type: "heading",
        level: 2,
        id: "uno",
        eyebrow: "01 - Unidad",
        text: "Un solo Dios",
      },
      {
        type: "verse",
        reference: "Deuteronomio 6 · 4",
        text: "Oye, Israel: Jehová nuestro Dios, Jehová uno es.",
      },
      {
        type: "paragraph",
        html: "Desde las primeras páginas hasta las últimas, la Biblia afirma que hay un solo Dios. No es una fuerza ni una idea: es una Persona que habla, actúa y se relaciona con lo que creó.",
      },
      {
        type: "heading",
        level: 2,
        id: "creador",
        eyebrow: "02 - Creador",
        text: "Creador y sostenedor de todo",
      },
      {
        type: "verse",
        reference: "Salmo 19 · 1",
        text: "Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos.",
      },
      {
        type: "paragraph",
        html: "La Biblia enseña que Dios hizo todas las cosas de la nada y que las sostiene por su poder. Nada de lo que existe lo sorprendió ni escapa de su cuidado. Por eso decimos que es soberano: gobierna la historia y a la vez se interesa por cada persona.",
      },
      {
        type: "heading",
        level: 2,
        id: "tres-personas",
        eyebrow: "03 - Trinidad",
        text: "Padre, Hijo y Espíritu Santo",
      },
      {
        type: "verse",
        reference: "2 Corintios 13 · 14",
        text: "La gracia del Señor Jesucristo, el amor de Dios, y la comunión del Espíritu Santo sean con todos vosotros.",
      },
      {
        type: "paragraph",
        html: 'Los cristianos creemos en un solo Dios que existe en tres Personas: el Padre, el Hijo y el Espíritu Santo. Comparten la misma naturaleza divina y actúan en perfecta unidad, aunque tienen funciones distintas. Es un misterio que no podemos agotar con la razón, pero la Biblia lo afirma con claridad, por ejemplo en el mandato de bautizar "en el nombre del Padre, y del Hijo, y del Espíritu Santo".',
      },
      {
        type: "heading",
        level: 2,
        id: "en-jesus",
        eyebrow: "04 - Revelación",
        text: "Dios se dio a conocer en Jesús",
      },
      {
        type: "verse",
        reference: "1 Timoteo 2 · 5",
        text: "Porque hay un solo Dios, y un solo mediador entre Dios y los hombres, Jesucristo hombre.",
      },
      {
        type: "paragraph",
        html: "Dios no se quedó lejos. El Hijo eterno se hizo hombre, vivió sin pecado, murió en la cruz por su pueblo y resucitó al tercer día. Si quieres saber cómo es Dios, mira a Jesús: ahí están su justicia, su verdad y su misericordia juntas.",
      },
      {
        type: "pullquote",
        quote: "Si quieres saber cómo es Dios, mira a Jesús.",
      },
      {
        type: "heading",
        level: 2,
        id: "que-cambia",
        eyebrow: "05 - Vida",
        text: "Qué cambia saber quién es Dios",
      },
      {
        type: "list",
        items: [
          "<strong>Podemos confiar.</strong> Un Dios soberano y bueno no pierde el control de nuestra vida.",
          "<strong>Podemos hablarle.</strong> Por medio de Jesús tenemos acceso al Padre.",
          "<strong>Podemos adorarlo.</strong> Todo lo que existe fue hecho para su gloria.",
        ],
      },
      {
        type: "paragraph",
        html: 'Si quieres seguir leyendo, la doctrina completa sobre Dios está en nuestra <a href="/confesion-de-fe">confesión de fe</a>, y cada domingo puedes escucharla enseñar en <a href="/visitanos">nuestro culto</a>.',
      },
      { type: "tags", tags: ["Dios", "Trinidad", "Guía", "Biblia"] },
    ],
  },
  {
    slug: "que-creen-los-bautistas",
    year: "2026",
    month: "11",
    day: "17",
    issue: "N. 045",
    title: "¿Qué creen los bautistas?",
    seoTitle: "¿Qué creen los bautistas? Doctrina bautista explicada",
    description:
      "Qué creen los bautistas: la Biblia como autoridad, la salvación por gracia, la iglesia como cuerpo de Cristo y las dos ordenanzas, bautismo y Cena del Señor.",
    excerpt:
      "Una explicación breve de lo que creemos en Iglesia Bautista El Ancla: la Biblia, la gracia, la iglesia y las ordenanzas.",
    category: "Estudio",
    filter: "estudio",
    publishedAt: "2026-11-17",
    displayDate: "17 · NOV · 2026",
    compactDate: "17 · NOV",
    readTime: "2 min",
    wordCount: "316 palabras",
    author: authors.editorial,
    coverGlyph: "BAU",
    coverLabel: "[ guía ]",
    coverCaption: "Guía · Doctrina bautista",
    tint: "#efebe3",
    accent: "rgba(255, 46, 52, 0.2)",
    tags: ["Bautistas", "Doctrina", "Confesión de fe", "Guía"],
    relatedSlugs: ["que-es-la-fe-cristiana", "quien-es-dios-segun-la-biblia"],
    body: [
      {
        type: "paragraph",
        html: "Los bautistas creen que la Biblia es la autoridad final para la fe y la vida, que la salvación es un regalo de Dios por gracia mediante la fe en Jesucristo, y que la iglesia es el cuerpo de Cristo, expresado en cada comunidad local. Practican el bautismo por inmersión y la Cena del Señor.",
        dropCap: true,
      },
      {
        type: "heading",
        level: 2,
        id: "biblia",
        eyebrow: "01 - Autoridad",
        text: "La Biblia como autoridad final",
      },
      {
        type: "verse",
        reference: "2 Timoteo 3 · 16",
        text: "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.",
      },
      {
        type: "paragraph",
        html: "Creemos que la Biblia es la Palabra de Dios, inspirada y suficiente para la fe y la práctica. Por eso en cada culto se abre y se explica un texto, y por eso las demás cosas que creemos buscan apoyarse en ella.",
      },
      {
        type: "heading",
        level: 2,
        id: "salvacion",
        eyebrow: "02 - Gracia",
        text: "La salvación es por gracia",
      },
      {
        type: "paragraph",
        html: 'Somos salvos por gracia, a través de la fe en Jesucristo, y no por obras. Es un regalo gratuito de Dios. Si quieres ver el texto detrás de esta convicción, lo explicamos en <a href="/blog/2026/11/17/que-es-la-fe-cristiana">¿Qué es la fe cristiana?</a>',
      },
      {
        type: "heading",
        level: 2,
        id: "iglesia",
        eyebrow: "03 - Iglesia",
        text: "La iglesia",
      },
      {
        type: "paragraph",
        html: "La iglesia es el cuerpo de Cristo, formado por todos los creyentes verdaderos. Se expresa localmente en comunidades que se reúnen para adorar, servir y proclamar el evangelio.",
      },
      {
        type: "heading",
        level: 2,
        id: "ordenanzas",
        eyebrow: "04 - Ordenanzas",
        text: "Bautismo y Cena del Señor",
      },
      {
        type: "verse",
        reference: "Mateo 28 · 19",
        text: "Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo.",
      },
      {
        type: "paragraph",
        html: "Practicamos dos ordenanzas: el bautismo por inmersión y la Cena del Señor. No son un medio para ser salvos, sino actos de obediencia, símbolo y memoria de lo que Cristo hizo.",
      },
      {
        type: "heading",
        level: 2,
        id: "nueve",
        eyebrow: "05 - Resumen",
        text: "Las nueve doctrinas de El Ancla",
      },
      {
        type: "paragraph",
        html: 'En nuestra <a href="/confesion-de-fe">confesión de fe</a> reunimos lo que creemos en nueve doctrinas:',
      },
      {
        type: "list",
        items: [
          "Dios",
          "Jesucristo",
          "El Espíritu Santo",
          "La Biblia",
          "La Iglesia",
          "El hombre",
          "La salvación",
          "Las ordenanzas",
          "La escatología: el regreso de Cristo",
        ],
      },
      {
        type: "paragraph",
        html: "Cada una incluye su texto bíblico y sus referencias, para que puedas comprobar por ti mismo si lo que decimos está en la Escritura.",
      },
      {
        type: "tags",
        tags: ["Bautistas", "Doctrina", "Confesión de fe", "Guía"],
      },
    ],
  },
  {
    slug: "que-es-una-iglesia",
    year: "2026",
    month: "11",
    day: "17",
    issue: "N. 046",
    title: "¿Qué es una iglesia y por qué importa?",
    seoTitle: "¿Qué es una iglesia y por qué importa? Guía sencilla",
    description:
      "Qué es una iglesia según la Biblia: el cuerpo de Cristo, un pueblo que se reúne para adorar, aprender, servirse y compartir el evangelio.",
    excerpt:
      "La iglesia no es un edificio. Es el pueblo de Dios que se reúne para adorar, aprender de la Biblia y servirse unos a otros.",
    category: "Iglesia",
    filter: "iglesia",
    publishedAt: "2026-11-17",
    displayDate: "17 · NOV · 2026",
    compactDate: "17 · NOV",
    readTime: "2 min",
    wordCount: "306 palabras",
    author: authors.editorial,
    coverGlyph: "IG",
    coverLabel: "[ guía ]",
    coverCaption: "Guía · Qué es una iglesia",
    tint: "#efebe3",
    accent: "rgba(255, 46, 52, 0.2)",
    tags: ["Iglesia", "Comunidad", "Guía", "Biblia"],
    relatedSlugs: ["que-creen-los-bautistas", "que-es-la-fe-cristiana"],
    body: [
      {
        type: "paragraph",
        html: "Según la Biblia, la iglesia es el cuerpo de Cristo: todas las personas que confían en Jesús. Se expresa en comunidades locales que se reúnen para adorar a Dios, aprender de la Biblia, servirse unos a otros y compartir el evangelio. No es un edificio, sino un pueblo.",
        dropCap: true,
      },
      {
        type: "heading",
        level: 2,
        id: "no-edificio",
        eyebrow: "01 - Aclarando",
        text: "No es un edificio",
      },
      {
        type: "paragraph",
        html: 'Cuando decimos "la iglesia" solemos pensar en un lugar. En el Nuevo Testamento la palabra se refiere a personas: los que pertenecen a Cristo. Un edificio sirve para reunirse, pero lo que hace a la iglesia es la gente que lo llena.',
      },
      {
        type: "heading",
        level: 2,
        id: "que-hace",
        eyebrow: "02 - Vida juntos",
        text: "Qué hace una iglesia",
      },
      {
        type: "verse",
        reference: "Hechos 2 · 42",
        text: "Y perseveraban en la doctrina de los apóstoles, en la comunión unos con otros, en el partimiento del pan y en las oraciones.",
      },
      {
        type: "list",
        items: [
          "<strong>Enseña la Biblia.</strong> Escuchar y entender la Escritura es el centro de la reunión.",
          "<strong>Ora y adora.</strong> Cantamos, damos gracias y pedimos por los demás.",
          "<strong>Celebra las ordenanzas.</strong> El bautismo y la Cena del Señor.",
          "<strong>Se sirve.</strong> Cada persona aporta lo que Dios le dio, en distintos ministerios.",
          "<strong>Comparte el evangelio.</strong> La buena noticia de Jesús es para todos.",
        ],
      },
      {
        type: "heading",
        level: 2,
        id: "por-que-importa",
        eyebrow: "03 - Importancia",
        text: "Por qué importa",
      },
      {
        type: "paragraph",
        html: "La fe cristiana se vive en comunidad. Necesitamos a otros para aprender, para que nos corrijan con amor, para ser consolados y para servir. Quien camina solo se cansa más rápido; la iglesia existe para sostenernos mientras caminamos.",
      },
      {
        type: "pullquote",
        quote:
          "La iglesia no es un lugar al que vamos: es un pueblo al que pertenecemos.",
      },
      {
        type: "heading",
        level: 2,
        id: "como-elegir",
        eyebrow: "04 - Si buscas una",
        text: "Cómo elegir una iglesia",
      },
      {
        type: "list",
        items: [
          "Que enseñe la Biblia y explique con claridad el evangelio.",
          "Que sea transparente en lo que cree, con una confesión de fe pública.",
          "Que te reciba sin presión y sin exigirte nada para sentarte a escuchar.",
          "Que tenga una vida comunitaria real durante la semana.",
        ],
      },
      {
        type: "paragraph",
        html: 'Así intentamos ser en El Ancla. Si quieres conocernos, <a href="/visitanos">aquí está cómo visitarnos</a>, y puedes leer <a href="/nosotros">nuestra historia</a> antes de venir.',
      },
      { type: "tags", tags: ["Iglesia", "Comunidad", "Guía", "Biblia"] },
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
  ...guideArticles,
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

/** Placeholder articles (seedBody) carry an editorial note; they must not be indexed yet. */
export const isSeedArticle = (article: BlogArticle) =>
  article.body.some((block) => block.type === 'note');

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
