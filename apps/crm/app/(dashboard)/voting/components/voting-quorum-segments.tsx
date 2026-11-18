import { cn } from "@/lib/utils";

const SEGMENT_COUNT = 20;

const votingQuorumSegmentsVotingPage = {
  track: cn("flex gap-1"),
  filled: cn("h-[22px] flex-1 rounded-full bg-[linear-gradient(180deg,#e9c873,#c9a14a)]"),
  empty: cn("h-[22px] flex-1 rounded-full bg-white/[0.14]"),
};

interface VotingQuorumSegmentsProps {
  /** 0 to 100. */
  percent: number;
}

/** Twenty gold segments on the dark control card; each one is 5 % of the roll. */
export function VotingQuorumSegments({ percent }: VotingQuorumSegmentsProps) {
  const filled = Math.round((Math.min(100, Math.max(0, percent)) / 100) * SEGMENT_COUNT);

  return (
    <div
      aria-label={`Quórum: ${percent} %`}
      className={votingQuorumSegmentsVotingPage.track}
      role="img"
    >
      {Array.from({ length: SEGMENT_COUNT }, (_, index) => (
        <span
          className={
            index < filled
              ? votingQuorumSegmentsVotingPage.filled
              : votingQuorumSegmentsVotingPage.empty
          }
          // Segments never reorder, so the index is a stable key.
          key={`segment-${index + 1}`}
        />
      ))}
    </div>
  );
}
