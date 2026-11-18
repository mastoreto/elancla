import { currentUser } from "@/lib/data";
import { blogCategories } from "../data/blog-seeds";
import type { BlogAuthor } from "../types";
import { NewPostForm } from "./components/new-post-form";

const loggedAuthor: BlogAuthor = {
  id: currentUser.id,
  name: currentUser.name,
};

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function NewBlogPostPage() {
  return <NewPostForm author={loggedAuthor} categories={blogCategories} />;
}
