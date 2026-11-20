// Team shown on /nosotros; moved here from the web i18n files when 1.3b made it editable.
// Keyed by locale so adding a language is a data change.

export interface SeedTeamMember {
  name: string;
  bio: Record<string, string>;
  title: Record<string, string>;
}

export const EL_ANCLA_TEAM: readonly SeedTeamMember[] = [
  {
    name: "Pr. Juan Olivera",
    bio: {
      es: "En el pastorado desde 2007. Lleva la predicación dominical y la serie expositiva de Hebreos.",
      en: "Pastoring since 2007. Leads Sunday preaching and the expository series in Hebrews.",
      pt: "No pastorado desde 2007. Conduz a pregação dominical e a série expositiva de Hebreus.",
    },
    title: {
      es: "Pastor principal",
      en: "Lead pastor",
      pt: "Pastor principal",
    },
  },
  {
    name: "Pr. Martín Recalde",
    bio: {
      es: "Coordina la enseñanza, los grupos de crecimiento y el discipulado a nuevos creyentes.",
      en: "Coordinates teaching, growth groups, and discipleship for new believers.",
      pt: "Coordena o ensino, os grupos de crescimento e o discipulado de novos crentes.",
    },
    title: {
      es: "Pastor asociado",
      en: "Associate pastor",
      pt: "Pastor associado",
    },
  },
  {
    name: "Sebastián Pérez",
    bio: {
      es: "Acompaña la pastoral de hombres y supervisa el ministerio de misiones locales.",
      en: "Supports pastoral care for men and oversees local missions.",
      pt: "Acompanha a pastoral de homens e supervisiona missões locais.",
    },
    title: {
      es: "Anciano",
      en: "Elder",
      pt: "Presbítero",
    },
  },
  {
    name: "Carolina Vidal",
    bio: {
      es: "Lidera Espacio Mujer y la red de hospitalidad y cuidado de la congregación.",
      en: "Leads Women's Space and the congregation's hospitality and care network.",
      pt: "Lidera Espaço Mulher e a rede de hospitalidade e cuidado da congregação.",
    },
    title: {
      es: "Diaconisa",
      en: "Deaconess",
      pt: "Diaconisa",
    },
  },
  {
    name: "Diego Acosta",
    bio: {
      es: "Coordina los aspectos de logística, finanzas y servicio dominical de la iglesia.",
      en: "Coordinates logistics, finances, and Sunday service operations.",
      pt: "Coordena logística, finanças e serviço dominical da igreja.",
    },
    title: {
      es: "Diácono",
      en: "Deacon",
      pt: "Diácono",
    },
  },
  {
    name: "Lucía Núñez",
    bio: {
      es: "Acompaña al ministerio de adolescentes y jóvenes y la formación bíblica de menores de 25.",
      en: "Walks with teens and young adults in biblical formation for those under 25.",
      pt: "Acompanha adolescentes e jovens na formação bíblica de menores de 25 anos.",
    },
    title: {
      es: "Líder de jóvenes",
      en: "Youth leader",
      pt: "Líder de jovens",
    },
  },
];
