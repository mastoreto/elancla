import { notFound } from "next/navigation";
import { InventoryDetailContent } from "../components";
import { getInventoryDetail } from "../utils/inventory-detail";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getInventoryDetail(id);

  if (!item) {
    notFound();
  }

  return <InventoryDetailContent item={item} />;
}
