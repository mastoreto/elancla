import { MinistriesPageContent } from "./components";
import { ministries } from "./data/ministries";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function MinistriesPage() {
  return <MinistriesPageContent ministries={ministries} />;
}
