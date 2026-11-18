import { notFound } from "next/navigation";
import { AssemblyPanelContent } from "../components";
import { getAssemblyReport } from "../utils/assembly-access";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function AssemblyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getAssemblyReport(id);

  if (!report) {
    notFound();
  }

  return <AssemblyPanelContent report={report} />;
}
