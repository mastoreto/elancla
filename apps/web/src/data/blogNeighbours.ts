import type { BlogArticle } from 'src/data/blog';

/** Related (explicit slugs, then same category, then the rest) and previous/next by publish date, from the live post list. */
export function getBlogNeighbours(
  posts: BlogArticle[],
  article: BlogArticle,
  limit = 3
) {
  const others = posts.filter((post) => post.slug !== article.slug);
  const explicit = article.relatedSlugs
    .map((slug) => others.find((post) => post.slug === slug))
    .filter((post): post is BlogArticle => post !== undefined);
  const rest = others.filter((post) => !explicit.includes(post));
  const sameCategory = rest.filter(
    (post) => post.category === article.category
  );
  const related = [
    ...explicit,
    ...sameCategory,
    ...rest.filter((post) => !sameCategory.includes(post)),
  ].slice(0, limit);

  const byDate = [...posts].sort((a, b) =>
    a.publishedAt.localeCompare(b.publishedAt)
  );
  const index = byDate.findIndex((post) => post.slug === article.slug);
  return {
    related,
    previous: index > 0 ? byDate[index - 1] : null,
    next: index >= 0 && index < byDate.length - 1 ? byDate[index + 1] : null,
  };
}
