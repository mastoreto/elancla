import { ReportsListPageContent } from "./components/reports-list-page-content";
import { generatedReports } from "./demo-data";

export default function ReportsPage() {
  return <ReportsListPageContent reports={generatedReports} />;
}
