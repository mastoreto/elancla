import { notFound } from "next/navigation";
import { MinistryForm } from "../../components";
import { getMinistryDetail } from "../../utils/ministry-detail";

export default async function EditMinistryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ministry = getMinistryDetail(id);

  if (!ministry) {
    notFound();
  }

  return (
    <MinistryForm
      initialValues={{
        name: ministry.name,
        description: ministry.description,
        category: ministry.category,
        ages: ministry.ages,
        howToJoin: "",
        leaderName: ministry.leaderName,
        coLeaderName: ministry.coLeaderName ?? "",
        schedule: ministry.schedule,
        location: "",
        budget: String(ministry.budget),
        currency: ministry.currency,
        visibleOnSite: ministry.visibleOnSite,
      }}
      mode="edit"
    />
  );
}
