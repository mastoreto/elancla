import { notFound } from "next/navigation";
import { MinistryDetailContent } from "../components";
import { getMinistryDetail } from "../utils/ministry-detail";

export default async function MinistryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ministry = getMinistryDetail(id);

  if (!ministry) {
    notFound();
  }

  return <MinistryDetailContent ministry={ministry} />;
}
