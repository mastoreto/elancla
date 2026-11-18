import { podcastSeries } from "../data/podcast-seeds";
import { NewPodcastForm } from "./components/new-podcast-form";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function NewPodcastPage() {
  return <NewPodcastForm series={podcastSeries} />;
}
