import { VotingVotePageContent } from "../../components/voting-vote-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function VotingVotePage({
  params,
}: {
  params: Promise<{ votingId: string }>;
}) {
  const { votingId } = await params;

  return <VotingVotePageContent votingId={votingId} />;
}
