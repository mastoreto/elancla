import { VotingResultsPageContent } from "../../components/voting-results-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function VotingResultsPage({
  params,
}: {
  params: Promise<{ votingId: string }>;
}) {
  const { votingId } = await params;

  return <VotingResultsPageContent votingId={votingId} />;
}
