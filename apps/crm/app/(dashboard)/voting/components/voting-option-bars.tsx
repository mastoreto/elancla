import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { cn } from "@/lib/utils";
import type { VotingRecord } from "../types";
import { getOptionResults } from "../utils/voting-view";

interface VotingOptionBarsProps {
  voting: VotingRecord;
}

const votingOptionBarsVotingPage = {
  list: cn("flex flex-col gap-[18px]"),
  item: cn("flex flex-col gap-[7px]"),
  row: cn("flex justify-between text-sm"),
  count: cn("text-[var(--tinta-suave)] tabular-nums"),
  strong: cn("text-foreground"),
  track: cn("h-3"),
};

/** One labelled bar per option: "A favor — 52 votos · 67 %". */
export function VotingOptionBars({ voting }: VotingOptionBarsProps) {
  return (
    <div className={votingOptionBarsVotingPage.list}>
      {getOptionResults(voting).map(({ option, percent, tone }) => (
        <div className={votingOptionBarsVotingPage.item} key={option.id}>
          <div className={votingOptionBarsVotingPage.row}>
            <b>{option.label}</b>
            <span className={votingOptionBarsVotingPage.count}>
              <b className={votingOptionBarsVotingPage.strong}>{option.votes}</b> votos · {percent}{" "}
              %
            </span>
          </div>
          <ProgressBar
            className={votingOptionBarsVotingPage.track}
            label={`${option.label}: ${percent} %`}
            tone={tone}
            value={percent}
          />
        </div>
      ))}
    </div>
  );
}
