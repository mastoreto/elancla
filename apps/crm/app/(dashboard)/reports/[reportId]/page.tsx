import { notFound } from "next/navigation";
import { ReportDetailContent } from "../components/report-detail-content";
import { getReportDetail } from "../data/report-seeds";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const detail = getReportDetail(reportId);

  if (!detail) {
    notFound();
  }

  return <ReportDetailContent detail={detail} />;
}
