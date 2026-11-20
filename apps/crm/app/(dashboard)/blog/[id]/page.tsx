import { createServerApiClient } from "@/lib/api/createServerApiClient";
// ponytail: shared with the people and pages screens; it moves to `lib` if a fourth one needs it.
import { loadSiteLocales } from "../../website/people/lib/loadSiteLocales";
import { PostForm } from "./components/post-form";
import { loadPostFormOptions } from "./lib/loadPostFormOptions";
import { loadPostStatus } from "./lib/loadPostStatus";

interface EditPostProps {
  params: Promise<{ id: string }>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditPostPage({ params }: EditPostProps) {
  const { id } = await params;
  const api = await createServerApiClient();
  const [status, site, options] = await Promise.all([
    loadPostStatus(api, id),
    loadSiteLocales(api),
    loadPostFormOptions(api, { postId: id }),
  ]);
  return <PostForm options={options} postId={id} site={site} status={status} />;
}
