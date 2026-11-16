import {
  type BlogArchiveItem,
  type BlogArticle,
  type BlogCategory,
  type BlogPopularItem,
  type BlogSeriesItem,
  blogArticles,
  blogCategories,
  blogSeries,
  featuredArticle,
} from './blog';

export interface BlogPageData {
  articles: BlogArticle[];
  categories: BlogCategory[];
  featured: BlogArticle | null;
  marqueeItems: string[];
  series: BlogSeriesItem[];
  popular: BlogPopularItem[];
  tags: string[];
  archive: BlogArchiveItem[];
}

// ─── Acceso a contenido (listo para el CMS custom) ───────────────────────────
// Hoy devuelven datos seed estáticos. Cuando exista @ancla/db, estas funciones
// pasan a leer del CMS custom SIN cambiar su firma ni los consumidores (el ancla
// lee, iEkklesia escribe). Mantienen la misma API que tenía la capa de Sanity.

export async function getAllPostCards(): Promise<BlogArticle[]> {
  return blogArticles;
}

export async function getAllPostsFull(): Promise<BlogArticle[]> {
  return blogArticles;
}

export async function getPostBySlug(slug: string): Promise<BlogArticle | null> {
  return blogArticles.find((a) => a.slug === slug) ?? null;
}

export async function getFeaturedPostCard(): Promise<BlogArticle | null> {
  return featuredArticle ?? null;
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  return blogCategories;
}

export async function getAllSeriesWithPosts(): Promise<BlogSeriesItem[]> {
  return blogSeries;
}

function buildArchive(articles: BlogArticle[]): BlogArchiveItem[] {
  const map = new Map<string, number>();
  for (const a of articles) {
    const d = new Date(a.publishedAt);
    const key = d.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
    });
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

/**
 * Ensambla los datos de la página de blog a partir del contenido ya mapeado.
 * Recibe lo que devuelven getAllPostCards / getAllCategories / getAllSeriesWithPosts.
 */
export function buildBlogPageData(
  posts: BlogArticle[],
  categories: BlogCategory[],
  allSeries: BlogSeriesItem[]
): BlogPageData {
  const articles = posts;

  const counts = new Map<string, number>();
  for (const a of articles) {
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }

  const categoriesWithCounts = categories.map((c) => ({
    ...c,
    count: counts.get(c.name) ?? c.count ?? 0,
  }));

  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null;

  return {
    articles,
    categories: categoriesWithCounts,
    featured,
    marqueeItems: categories.map((c) => c.name),
    series: allSeries,
    popular: articles.slice(0, 5).map((article) => ({ article, reads: '—' })),
    tags: [...new Set(articles.flatMap((a) => a.tags ?? []))],
    archive: buildArchive(articles),
  };
}
