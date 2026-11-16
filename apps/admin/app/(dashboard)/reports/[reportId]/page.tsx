import { notFound } from "next/navigation";
import { ReportDetailPageClient } from "../components/report-detail-page-client";
import { reportDetailsById } from "../demo-data";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = reportDetailsById[reportId];

  if (!report) {
    notFound();
  }

  return <ReportDetailPageClient report={report} />;
}
