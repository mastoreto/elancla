import type { PersonProfileDto } from "@ancla/contracts";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";
import type { PostFormOptions } from "../../types";

const BLOG_AUTHOR_CONTEXT = "blog-author";

function isBlogAuthor(person: PersonProfileDto): boolean {
  return person.roles.some((role) => role.context === BLOG_AUTHOR_CONTEXT);
}

/**
 * What the post's selects offer. A role that can edit posts but cannot read one of the lists
 * (people, taxonomy) gets that select empty rather than a broken page.
 */
export async function loadPostFormOptions(
  api: ServerApiClient,
  { postId }: { postId: string },
): Promise<PostFormOptions> {
  const [people, categories, series, posts] = await Promise.all([
    api.content.people.$get(),
    api.content.categories.$get(),
    api.content.series.$get(),
    api.content.posts.$get(),
  ]);
  const authors = people.ok ? (await people.json()).data.filter(isBlogAuthor) : [];
  const postItems = posts.ok ? (await posts.json()).items : [];
  return {
    authors,
    categories: categories.ok ? (await categories.json()).items : [],
    series: series.ok ? (await series.json()).items : [],
    relatable: postItems
      .filter((post) => post.id !== postId)
      .map((post) => ({ id: post.id, title: post.title ?? "Sin título" })),
  };
}
