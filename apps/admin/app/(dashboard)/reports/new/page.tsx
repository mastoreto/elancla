import { ReportCreatePageContent } from "../components/report-create-page-content";
import { initialReportBuilderValues, ministryOptions, projectOptions } from "../demo-data";

export default function NewReportPage() {
  return (
    <ReportCreatePageContent
      initialValues={initialReportBuilderValues}
      ministryOptions={[...ministryOptions]}
      projectOptions={[...projectOptions]}
    />
  );
}
