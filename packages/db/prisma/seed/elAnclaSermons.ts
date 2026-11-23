// Dev data for the sermons (phase 1.7a). The video ids are made up: the seed never touches the
// network, so the platform data is loaded by hand and the thumbnails do not resolve.
import type { BibleBookCode } from "@ancla/contracts";

export const SEED_PREACHER_NAMES = [
  "Pr. Juan Olivera",
  "Pr. Martín Recalde",
] as const;

export const SEED_SERIES = {
  titles: {
    es: "Hebreos: Cristo es mejor",
    en: "Hebrews: Christ is better",
    pt: "Hebreus: Cristo é melhor",
  },
  slugs: {
    es: "hebreos-cristo-es-mejor",
    en: "hebrews-christ-is-better",
    pt: "hebreus-cristo-e-melhor",
  },
  descriptions: {
    es: "Serie expositiva de la carta a los Hebreos: Cristo es superior a todo lo que le precedió.",
    en: "Expository series on the letter to the Hebrews: Christ is better than everything that came before.",
    pt: "Série expositiva da carta aos Hebreus: Cristo é superior a tudo o que o precedeu.",
  },
  tags: {
    es: ["Hebreos", "Exposición"],
    en: ["Hebrews", "Exposition"],
    pt: ["Hebreus", "Exposição"],
  },
  plannedCount: 13,
} as const;

export interface SeedSermonTexts {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
}

export interface SeedSermonPassage {
  book: BibleBookCode;
  chapter: number;
  verseFrom?: number;
  verseTo?: number;
}

export interface SeedSermon {
  key: string;
  preacher: (typeof SEED_PREACHER_NAMES)[number];
  /** Position in the seeded series; absent for a sermon outside it. */
  seriesOrder?: number;
  /** `YYYY-MM-DD`: the day it was preached and went live. */
  preachedOn: string;
  featured?: boolean;
  passages: SeedSermonPassage[];
  /** Only the first sermon carries an outline and the preacher's notes. */
  withOutline?: boolean;
  videoId: string;
  durationSeconds: number;
  viewCount: number;
  translations: Record<string, SeedSermonTexts>;
}

export const SEED_SERMONS: readonly SeedSermon[] = [
  {
    key: "better-than-angels",
    preacher: "Pr. Juan Olivera",
    seriesOrder: 1,
    preachedOn: "2026-10-04",
    featured: true,
    passages: [
      { book: "Heb", chapter: 1, verseFrom: 1, verseTo: 4 },
      { book: "Ps", chapter: 110, verseFrom: 1 },
    ],
    withOutline: true,
    videoId: "aB3dE5fG7hJ",
    durationSeconds: 2712,
    viewCount: 143,
    translations: {
      es: {
        title: "Dios nos ha hablado por el Hijo",
        slug: "dios-nos-ha-hablado-por-el-hijo",
        summary:
          "Hebreos 1 abre con la revelación final de Dios: no un profeta más, sino su Hijo, superior a los ángeles.",
        tags: ["Hebreos", "Cristo", "Revelación"],
      },
      en: {
        title: "God has spoken to us by his Son",
        slug: "god-has-spoken-to-us-by-his-son",
        summary:
          "Hebrews 1 opens with God's final revelation: not one more prophet, but his Son, greater than the angels.",
        tags: ["Hebrews", "Christ", "Revelation"],
      },
      pt: {
        title: "Deus nos falou pelo Filho",
        slug: "deus-nos-falou-pelo-filho",
        summary:
          "Hebreus 1 abre com a revelação final de Deus: não mais um profeta, mas o seu Filho, superior aos anjos.",
        tags: ["Hebreus", "Cristo", "Revelação"],
      },
    },
  },
  {
    key: "great-high-priest",
    preacher: "Pr. Juan Olivera",
    seriesOrder: 2,
    preachedOn: "2026-10-11",
    passages: [{ book: "Heb", chapter: 4, verseFrom: 14, verseTo: 16 }],
    videoId: "kL9mN2pQ4rS",
    durationSeconds: 2540,
    viewCount: 98,
    translations: {
      es: {
        title: "Un gran sumo sacerdote",
        slug: "un-gran-sumo-sacerdote",
        summary:
          "Jesús nos entiende en la debilidad y nos invita a acercarnos con confianza al trono de la gracia.",
        tags: ["Hebreos", "Gracia"],
      },
      en: {
        title: "A great high priest",
        slug: "a-great-high-priest",
        summary:
          "Jesus understands our weakness and invites us to draw near to the throne of grace with confidence.",
        tags: ["Hebrews", "Grace"],
      },
      pt: {
        title: "Um grande sumo sacerdote",
        slug: "um-grande-sumo-sacerdote",
        summary:
          "Jesus entende a nossa fraqueza e nos convida a nos aproximar com confiança do trono da graça.",
        tags: ["Hebreus", "Graça"],
      },
    },
  },
  {
    key: "nothing-separates-us",
    preacher: "Pr. Martín Recalde",
    preachedOn: "2026-10-18",
    passages: [{ book: "Rom", chapter: 8, verseFrom: 31, verseTo: 39 }],
    videoId: "tU6vW8xY0zA",
    durationSeconds: 2895,
    viewCount: 211,
    translations: {
      es: {
        title: "Nada nos podrá separar",
        slug: "nada-nos-podra-separar",
        summary:
          "Romanos 8 termina con una certeza: ninguna circunstancia puede apartarnos del amor de Dios en Cristo.",
        tags: ["Romanos", "Esperanza"],
      },
      en: {
        title: "Nothing can separate us",
        slug: "nothing-can-separate-us",
        summary:
          "Romans 8 ends with a certainty: no circumstance can separate us from God's love in Christ.",
        tags: ["Romans", "Hope"],
      },
      pt: {
        title: "Nada nos poderá separar",
        slug: "nada-nos-podera-separar",
        summary:
          "Romanos 8 termina com uma certeza: nenhuma circunstância pode nos separar do amor de Deus em Cristo.",
        tags: ["Romanos", "Esperança"],
      },
    },
  },
];

/** The outline and the preacher's notes of the first sermon, per locale. */
export const SEED_OUTLINE: Record<
  string,
  { heading: string; points: string[]; notes: string }
> = {
  es: {
    heading: "Bosquejo",
    points: [
      "Dios habló de muchas maneras (v. 1)",
      "Dios habló por el Hijo (vv. 2-3)",
      "El Hijo es superior a los ángeles (v. 4)",
    ],
    notes:
      "Para conversar en casa: ¿qué cambia en nuestra vida si Dios ya dijo su última palabra en Jesús?",
  },
  en: {
    heading: "Outline",
    points: [
      "God spoke in many ways (v. 1)",
      "God spoke through the Son (vv. 2-3)",
      "The Son is greater than the angels (v. 4)",
    ],
    notes:
      "To talk about at home: what changes in our lives if God has already said his last word in Jesus?",
  },
  pt: {
    heading: "Esboço",
    points: [
      "Deus falou de muitas maneiras (v. 1)",
      "Deus falou pelo Filho (vv. 2-3)",
      "O Filho é superior aos anjos (v. 4)",
    ],
    notes:
      "Para conversar em casa: o que muda na nossa vida se Deus já disse a sua última palavra em Jesus?",
  },
};
