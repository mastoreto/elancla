// The 13 ministries of the landing mosaic; moved here from the web i18n files when 1.5 made them
// editable. Names and taglines are keyed by locale so adding a language is a data change.

export interface SeedMinistry {
  /** Slug (ASCII) used for every language and as the internal slug. */
  slug: string;
  /** `MINISTRY_ICONS` key, or null when the ministry has no icon. */
  icon: string | null;
  /** `MINISTRY_COLORS` key. */
  color: string;
  destination: "PAGE" | "EXTERNAL" | "NONE";
  externalUrl?: string;
  /** `LANDING_TONES` key of its tile. */
  landingTone: string;
  /** 1-based position in the mosaic. */
  landingOrder: number;
  /** Index into `EL_ANCLA_MINISTRY_CATEGORIES`. */
  categoryIndex: number;
  names: Record<string, string>;
  taglines: Record<string, string>;
}

export const EL_ANCLA_MINISTRY_CATEGORIES = [
  {
    order: 1,
    names: { es: "Crecer", en: "Grow", pt: "Crescer" },
  },
  {
    order: 2,
    names: { es: "Servir", en: "Serve", pt: "Servir" },
  },
] as const;

export const EL_ANCLA_MINISTRIES: readonly SeedMinistry[] = [
  {
    slug: "predicacion",
    icon: "predicacion",
    color: "obra-red",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 1,
    categoryIndex: 0,
    names: { es: "Predicación", en: "Preaching", pt: "Pregação" },
    taglines: {
      es: "La Palabra, expuesta fielmente",
      en: "The Word faithfully taught",
      pt: "A Palavra exposta fielmente",
    },
  },
  {
    slug: "ensenanza",
    icon: "ensenanza",
    color: "secondary-700",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 2,
    categoryIndex: 0,
    names: { es: "Enseñanza", en: "Teaching", pt: "Ensino" },
    taglines: {
      es: "Crecer en entendimiento",
      en: "Growing in understanding",
      pt: "Crescer em entendimento",
    },
  },
  {
    slug: "alabanza",
    icon: "alabanza",
    color: "secondary-600",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 3,
    categoryIndex: 0,
    names: { es: "Alabanza", en: "Worship", pt: "Louvor" },
    taglines: {
      es: "Cantar con entendimiento",
      en: "Singing with understanding",
      pt: "Cantar com entendimento",
    },
  },
  {
    slug: "oracion",
    icon: null,
    color: "secondary-300",
    destination: "NONE",
    landingTone: "mist",
    landingOrder: 4,
    categoryIndex: 0,
    names: { es: "Oración", en: "Prayer", pt: "Oração" },
    taglines: {
      es: "Clamar juntos",
      en: "Crying out together",
      pt: "Clamar juntos",
    },
  },
  {
    slug: "jovenes",
    icon: "jovenes",
    color: "secondary-400",
    destination: "PAGE",
    landingTone: "ink",
    landingOrder: 5,
    categoryIndex: 1,
    names: { es: "Jóvenes", en: "Youth", pt: "Jovens" },
    taglines: {
      es: "Una generación para Cristo",
      en: "A generation for Christ",
      pt: "Uma geração para Cristo",
    },
  },
  {
    slug: "adolescentes",
    icon: "adolescentes",
    color: "obra-blush",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 6,
    categoryIndex: 1,
    names: { es: "Adolescentes", en: "Teens", pt: "Adolescentes" },
    taglines: {
      es: "Raíces en la adolescencia",
      en: "Roots in adolescence",
      pt: "Raízes na adolescência",
    },
  },
  {
    slug: "misiones",
    icon: "misiones",
    color: "obra-warm-line",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 7,
    categoryIndex: 1,
    names: { es: "Misiones", en: "Missions", pt: "Missões" },
    taglines: {
      es: "Al fin del mundo",
      en: "To the ends of the earth",
      pt: "Até os confins da terra",
    },
  },
  {
    slug: "hombres",
    icon: "hombres",
    color: "obra-ink",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 8,
    categoryIndex: 1,
    names: { es: "Hombres", en: "Men", pt: "Homens" },
    taglines: {
      es: "Discipulado entre varones",
      en: "Discipleship among men",
      pt: "Discipulado entre homens",
    },
  },
  {
    slug: "espacio-mujer",
    icon: "espacio-mujer",
    color: "secondary-900",
    destination: "EXTERNAL",
    externalUrl: "https://emujer.elancla.uy/",
    landingTone: "red",
    landingOrder: 9,
    categoryIndex: 1,
    names: { es: "Espacio Mujer", en: "Women's Space", pt: "Espaço Mulher" },
    taglines: {
      es: "Mujeres en la Palabra",
      en: "Women in the Word",
      pt: "Mulheres na Palavra",
    },
  },
  {
    slug: "multimedia",
    icon: "multimedia",
    color: "secondary-800",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 10,
    categoryIndex: 1,
    names: { es: "Multimedia", en: "Multimedia", pt: "Multimídia" },
    taglines: {
      es: "Contar la historia",
      en: "Telling the story",
      pt: "Contar a história",
    },
  },
  {
    slug: "servicio",
    icon: "servicio",
    color: "secondary-700",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 11,
    categoryIndex: 1,
    names: { es: "Servicio", en: "Service", pt: "Serviço" },
    taglines: {
      es: "Manos que cuidan",
      en: "Hands that care",
      pt: "Mãos que cuidam",
    },
  },
  {
    slug: "espacio-cuidado",
    icon: "servicio",
    color: "secondary-800",
    destination: "PAGE",
    landingTone: "ink",
    landingOrder: 12,
    categoryIndex: 1,
    names: { es: "Espacio Cuidado", en: "Care Space", pt: "Espaço Cuidado" },
    taglines: {
      es: "Acompañar y cuidar",
      en: "Walking alongside, caring",
      pt: "Acompanhar e cuidar",
    },
  },
  {
    slug: "espacio-ancladitos",
    icon: "servicio",
    color: "secondary-600",
    destination: "PAGE",
    landingTone: "mist",
    landingOrder: 13,
    categoryIndex: 1,
    names: {
      es: "Espacio Ancladitos",
      en: "Ancladitos Space",
      pt: "Espaço Ancladitos",
    },
    taglines: {
      es: "Los niños, junto a Jesús",
      en: "Children, close to Jesus",
      pt: "As crianças, perto de Jesus",
    },
  },
];
