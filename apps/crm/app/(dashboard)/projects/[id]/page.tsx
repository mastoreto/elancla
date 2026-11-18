import { ProjectDetailContent } from "../components";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProjectDetailContent projectId={id} />;
}
