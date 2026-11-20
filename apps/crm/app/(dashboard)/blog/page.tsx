import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { BlogListPageContent } from "./components/blog-list-page-content";

const HTTP_FORBIDDEN = 403;

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function BlogPage() {
  const api = await createServerApiClient();
  const response = await api.content.posts.$get();

  // Like the proxy, a role without `blogPosts:view` does not learn the section exists.
  if (response.status === HTTP_FORBIDDEN) notFound();
  if (!response.ok) throw new Error(`Could not load the posts (${response.status})`);

  const { items } = await response.json();
  return <BlogListPageContent posts={items} />;
}
