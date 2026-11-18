import { ReportsListPageContent } from "./components/reports-list-page-content";
import { generatedReports } from "./data/report-seeds";

export default function ReportsPage() {
  return <ReportsListPageContent reports={generatedReports} />;
}
