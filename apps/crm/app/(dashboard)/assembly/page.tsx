import { AssemblyListPageContent } from "./components";
import { assemblyReports } from "./data/assembly-reports";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function AssemblyPage() {
  return <AssemblyListPageContent reports={assemblyReports} />;
}
