import { PodcastsPageContent } from "./components/podcasts-page-content";
import { podcasts } from "./data/podcast-seeds";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function PodcastsPage() {
  return <PodcastsPageContent podcasts={podcasts} />;
}
