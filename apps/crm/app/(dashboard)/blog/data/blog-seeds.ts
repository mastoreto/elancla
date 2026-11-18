import type { BlogAuthor, BlogCategory, BlogPost } from "../types";

// Seed data from the "crm-s-blog" board until posts come from the API.
export const blogAuthors: BlogAuthor[] = [
  { id: "author-1", name: "Pastor Daniel Rivas" },
  { id: "author-2", name: "Ana Martínez" },
  { id: "author-3", name: "Carlos Rodríguez" },
  { id: "author-4", name: "Laura González" },
];

export const blogCategories: BlogCategory[] = [
  { id: "cat-comunidad", label: "Comunidad" },
  { id: "cat-sermones", label: "Sermones" },
  { id: "cat-juventud", label: "Juventud" },
  { id: "cat-musica", label: "Música" },
  { id: "cat-evangelismo", label: "Evangelismo" },
];

const [comunidad, sermones, juventud, musica, evangelismo] = blogCategories as [
  BlogCategory,
  BlogCategory,
  BlogCategory,
  BlogCategory,
  BlogCategory,
];
const [daniel, ana, carlos, laura] = blogAuthors as [
  BlogAuthor,
  BlogAuthor,
  BlogAuthor,
  BlogAuthor,
];

export const blogPosts: BlogPost[] = [
  {
    id: "post-1",
    title: "Una iglesia que camina junta",
    slug: "una-iglesia-que-camina-junta",
    views: 1240,
    categories: [comunidad],
    writtenAt: "2026-11-10",
    publishedAt: "2026-11-12",
    author: daniel,
    status: "published",
  },
  {
    id: "post-2",
    title: "Cómo orar con profundidad en tiempos de ruido",
    slug: "orar-con-profundidad-en-tiempos-de-ruido",
    views: 860,
    categories: [sermones],
    writtenAt: "2026-11-03",
    publishedAt: "2026-11-05",
    author: ana,
    status: "published",
  },
  {
    id: "post-3",
    title: "Resumen del campamento de verano",
    slug: "resumen-del-campamento-de-verano",
    views: 530,
    categories: [juventud],
    writtenAt: "2026-10-26",
    publishedAt: "2026-10-28",
    author: carlos,
    status: "published",
  },
  {
    id: "post-4",
    title: "Nuevo álbum del equipo de adoración",
    slug: "nuevo-album-del-equipo-de-adoracion",
    views: 0,
    categories: [musica],
    writtenAt: "2026-11-14",
    publishedAt: undefined,
    author: laura,
    status: "draft",
  },
  {
    id: "post-5",
    title: "Guía para dar tus primeros pasos en la iglesia",
    slug: "guia-primeros-pasos-en-la-iglesia",
    views: 0,
    categories: [evangelismo],
    writtenAt: "2026-11-15",
    publishedAt: undefined,
    author: daniel,
    status: "draft",
  },
];
