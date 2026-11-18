import { BlogPageContent } from "./components/blog-page-content";
import { blogPosts } from "./data/blog-seeds";
import type { BlogConfig } from "./types";

// Operational state of the public-facing blog as a whole (seed default).
const BLOG_CONFIG: BlogConfig = { status: "live" };

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function BlogPage() {
  return <BlogPageContent config={BLOG_CONFIG} posts={blogPosts} />;
}
