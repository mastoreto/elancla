import type { PodcastHost } from "../types";
import { NewPodcastForm } from "./components/new-podcast-form";

// Platform members available for selection as participants
const PLATFORM_HOSTS: PodcastHost[] = [
  { id: "host-1", name: "Pastor Roberto Méndez" },
  { id: "host-2", name: "María García" },
  { id: "host-3", name: "Andrés López" },
  { id: "host-4", name: "Carolina Ruiz" },
];

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function NewPodcastPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <NewPodcastForm platformHosts={PLATFORM_HOSTS} />
    </div>
  );
}
