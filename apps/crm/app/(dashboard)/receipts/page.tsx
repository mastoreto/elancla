import { ReceiptsPageContent } from "./components";
import { initialReceipts, relatedOptions } from "./data/receipts";

export default function ReceiptsPage() {
  return <ReceiptsPageContent initialReceipts={initialReceipts} relatedOptions={relatedOptions} />;
}
