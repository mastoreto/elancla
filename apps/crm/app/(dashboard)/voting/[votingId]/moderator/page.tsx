import { VotingModeratorPageContent } from "../../components/voting-moderator-page-content";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function VotingModeratorPage({
  params,
}: {
  params: Promise<{ votingId: string }>;
}) {
  const { votingId } = await params;

  return <VotingModeratorPageContent votingId={votingId} />;
}
