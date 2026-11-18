import type { Sermon } from "../types";

// Seed data from the "crm-s-sermones" board until the sermon library comes from the API.
export const sermons: Sermon[] = [
  {
    id: "sermon-1",
    title: "La gracia que nos sostiene",
    preacher: "Pastor Daniel Rivas",
    passage: "Efesios 2:1-10",
    series: "Anclados en Cristo",
    status: "published",
    date: "2026-11-16",
    plays: 1480,
    youtubeUrl: "https://youtube.com/watch?v=Zq3aGx1",
  },
  {
    id: "sermon-2",
    title: "Una fe que persevera",
    preacher: "Pastor Daniel Rivas",
    passage: "Santiago 1:2-12",
    series: "Anclados en Cristo",
    status: "published",
    date: "2026-11-09",
    plays: 1120,
    youtubeUrl: "https://youtube.com/watch?v=Hn8Rt2k",
  },
  {
    id: "sermon-3",
    title: "Servir con alegría",
    preacher: "Carlos Rodríguez",
    passage: "Marcos 10:35-45",
    series: "Mensaje especial",
    status: "published",
    date: "2026-11-02",
    plays: 780,
    youtubeUrl: "https://youtube.com/watch?v=Wp5Lc9d",
  },
  {
    id: "sermon-4",
    title: "Esperar con esperanza",
    preacher: "Pastor Daniel Rivas",
    passage: "Isaías 40:28-31",
    series: "Adviento 2026",
    status: "draft",
    date: undefined,
    plays: undefined,
    youtubeUrl: "https://youtube.com/watch?v=Bv7Ye4m",
  },
];

export const sermonSeries = ["Anclados en Cristo", "Mensaje especial", "Adviento 2026"] as const;

export const sermonPreachers = [...new Set(sermons.map((sermon) => sermon.preacher))];
