import type { MinistryDetail } from "../types";

type DetailOverrides = Pick<
  MinistryDetail,
  "about" | "schedule" | "ages" | "coLeaderName" | "leaderSince" | "movements"
>;

// Seed detail copied from the "crm-s-ministerio-detalle" board. Ministries without an entry
// fall back to values derived from their summary until the Ministry API provides the rest.
export const ministryDetailOverrides: Record<string, DetailOverrides> = {
  jovenes: {
    about:
      "Los viernes por la noche nos reunimos con adolescentes y jóvenes para compartir la Palabra, jugar y cenar juntos. Una vez por trimestre organizamos un retiro y dos veces al año una jornada de servicio en el barrio.",
    schedule: "Viernes 20:00 · Salón de actos",
    ages: "13 a 25 años",
    coLeaderName: "Mariana Paz",
    leaderSince: 2023,
    movements: [
      {
        id: "m1",
        date: "2026-03-20",
        concept: "Suministros del campamento",
        project: "Retiro de verano",
        amount: -12_000,
      },
      {
        id: "m2",
        date: "2026-03-02",
        concept: "Alquiler de sonido",
        project: "Noche de jóvenes",
        amount: -6500,
      },
      {
        id: "m3",
        date: "2026-02-18",
        concept: "Aporte de familias",
        project: "Campamento",
        amount: 8000,
      },
    ],
  },
};
