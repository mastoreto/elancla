import { InventoryPageContent } from "./components";
import { inventoryItems } from "./data/inventory-items";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function InventoryPage() {
  return <InventoryPageContent items={inventoryItems} />;
}
