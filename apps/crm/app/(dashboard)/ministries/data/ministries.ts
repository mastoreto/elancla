import type { MinistrySummary } from "../types";

// Seed data taken from the "crm-s-ministerios" board until the Ministry API is wired.
export const ministries: MinistrySummary[] = [
  {
    id: "jovenes",
    name: "Ministerio de Jóvenes",
    category: "Por edades",
    description:
      "Espacio semanal para adolescentes y jóvenes: estudio bíblico, deporte, retiros y servicio en el barrio.",
    volunteers: 34,
    leaderName: "Carlos Rodríguez",
    currency: "$U",
    executed: 38_000,
    budget: 50_000,
    visibleOnSite: true,
  },
  {
    id: "adoracion",
    name: "Equipo de Adoración",
    category: "Cultos y Palabra",
    description:
      "Prepara la música y la liturgia de los cultos. Ensayos los jueves y apoyo técnico de sonido.",
    volunteers: 18,
    leaderName: "Ana Martínez",
    currency: "$U",
    executed: 27_500,
    budget: 30_000,
    visibleOnSite: true,
  },
  {
    id: "misiones",
    name: "Misiones",
    category: "Servicio",
    description:
      "Sostiene misioneros y viajes de servicio. Coordina con la iglesia asociada en São Paulo.",
    volunteers: 22,
    leaderName: "Roberto Silva",
    currency: "$",
    executed: 1200,
    budget: 1500,
    visibleOnSite: true,
  },
  {
    id: "alcance",
    name: "Alcance Comunitario",
    category: "Servicio",
    description:
      "Banco de alimentos, visitas y ayuda concreta a familias del barrio durante todo el año.",
    volunteers: 27,
    leaderName: "Laura González",
    currency: "$U",
    executed: 9800,
    budget: 25_000,
    visibleOnSite: true,
  },
  {
    id: "ninos",
    name: "Ministerio de Niños",
    category: "Por edades",
    description:
      "Escuela dominical, campamentos y cuidado de niños durante el culto, con equipo de voluntarios.",
    volunteers: 15,
    leaderName: "Diego Fernández",
    currency: "$U",
    executed: 19_400,
    budget: 20_000,
    visibleOnSite: true,
  },
];
