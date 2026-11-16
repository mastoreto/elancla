import { VotingOverviewPageContent } from "../components/voting-overview-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function VotingDetailPage({
  params,
}: {
  params: Promise<{ votingId: string }>;
}) {
  const { votingId } = await params;

  return <VotingOverviewPageContent votingId={votingId} />;
}
