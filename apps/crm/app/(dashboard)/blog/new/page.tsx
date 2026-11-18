import { currentUser } from "@/lib/data";
import type { BlogAuthor, BlogCategory } from "../types";
import { NewPostForm } from "./components/new-post-form";

// These would come from the database in a real implementation
const CATEGORIES: BlogCategory[] = [
  { id: "cat-fe", label: "Fe" },
  { id: "cat-evangelismo", label: "Evangelismo" },
  { id: "cat-juventud", label: "Juventud" },
  { id: "cat-musica", label: "Música" },
  { id: "cat-comunidad", label: "Comunidad" },
  { id: "cat-sermones", label: "Sermones" },
];

const loggedAuthor: BlogAuthor = {
  id: currentUser.id,
  name: currentUser.name,
};

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <NewPostForm author={loggedAuthor} categories={CATEGORIES} />
    </div>
  );
}
