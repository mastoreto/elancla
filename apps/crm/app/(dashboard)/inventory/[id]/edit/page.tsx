import { notFound } from "next/navigation";
import { InventoryForm } from "../../components";
import { getInventoryDetail, toInventoryFormValues } from "../../utils/inventory-detail";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getInventoryDetail(id);

  if (!item) {
    notFound();
  }

  return <InventoryForm initialValues={toInventoryFormValues(item)} mode="edit" />;
}
