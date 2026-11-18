import { Suspense } from "react";
import { ReportCreatePageContent } from "../components/report-create-page-content";

export default function NewReportPage() {
  return (
    <Suspense>
      <ReportCreatePageContent />
    </Suspense>
  );
}
