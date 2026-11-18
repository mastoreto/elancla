import type { Podcast, PodcastHost, PodcastSeries } from "../types";

// Seed data from the "crm-s-podcasts" board until episodes come from the API.
export const podcastHosts: PodcastHost[] = [
  { id: "host-1", name: "Pastor Daniel Rivas" },
  { id: "host-2", name: "Ana Martínez" },
  { id: "host-3", name: "Roberto Silva" },
];

export const podcastSeries: PodcastSeries[] = [
  { id: "ser-adoracion", label: "Adoración y reflexión" },
  { id: "ser-sermones", label: "Sermones dominicales" },
  { id: "ser-entrevistas", label: "Entrevistas" },
  { id: "ser-estudio", label: "Estudios bíblicos" },
];

const [adoracion, sermones, entrevistas, estudio] = podcastSeries as [
  PodcastSeries,
  PodcastSeries,
  PodcastSeries,
  PodcastSeries,
];
const [daniel, ana, roberto] = podcastHosts as [PodcastHost, PodcastHost, PodcastHost];

export const podcasts: Podcast[] = [
  {
    id: "ep-1",
    title: "Cuando la alabanza duele",
    description: "Alabar a Dios cuando las circunstancias no acompañan.",
    episode: 1,
    season: 1,
    duration: "42:00",
    series: adoracion,
    host: daniel,
    plays: 1120,
    createdAt: "2026-11-19",
    publishedAt: "2026-11-21",
    status: "published",
  },
  {
    id: "ep-2",
    title: "La duda también es camino",
    description: "Cómo acompañar las preguntas difíciles de la fe.",
    episode: 2,
    season: 1,
    duration: "36:00",
    series: sermones,
    host: ana,
    plays: 860,
    createdAt: "2026-11-12",
    publishedAt: "2026-11-14",
    status: "published",
  },
  {
    id: "ep-3",
    title: "Misión en Uganda",
    description: "Una entrevista sobre el trabajo misionero en África.",
    episode: 1,
    season: 1,
    duration: "58:00",
    series: entrevistas,
    host: roberto,
    plays: 640,
    createdAt: "2026-11-05",
    publishedAt: "2026-11-07",
    status: "published",
  },
  {
    id: "ep-4",
    title: "Adviento: esperar con esperanza",
    description: "Estudio sobre la espera en el tiempo de Adviento.",
    episode: 3,
    season: 1,
    duration: "",
    series: estudio,
    host: daniel,
    plays: 0,
    createdAt: "2026-11-18",
    publishedAt: undefined,
    status: "draft",
  },
];
