import type { BlogPost } from "../types";

export const BLOG_PAGE_SIZE = 5;

export function getTotalViews(posts: BlogPost[]): number {
  return posts.reduce((total, post) => total + post.views, 0);
}

/** Category used for grouping and the table: the first one assigned to the post. */
export function getPrimaryCategory(post: BlogPost): string {
  return post.categories[0]?.label ?? "Sin categoría";
}

export function getCategoryNames(posts: BlogPost[]): string[] {
  return [...new Set(posts.map(getPrimaryCategory))];
}

/** Drafts and pauses still waiting for a cover image. */
export function countWithoutImage(posts: BlogPost[]): number {
  return posts.filter((post) => post.status !== "published" && !post.heroImage).length;
}
