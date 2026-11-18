import { VouchersPageContent } from "./components";
import { initialVouchers, relatedOptions } from "./data/vouchers";

export default function VouchersPage() {
  return <VouchersPageContent initialVouchers={initialVouchers} relatedOptions={relatedOptions} />;
}
