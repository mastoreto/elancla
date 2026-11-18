import type { ProgressBarTone } from "@/components/dashboard/board/progress-bar";
import { cn } from "@/lib/utils";

interface DonutSlice {
  label: string;
  value: number;
  tone: ProgressBarTone;
}

const STROKE = {
  green: "stroke-[#276d4c]",
  rose: "stroke-primary",
  gold: "stroke-[#c9a14a]",
} as const;

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const votingDonutVotingPage = {
  svg: cn("size-[168px] -rotate-90"),
  track: cn("fill-none stroke-secondary"),
};

/** Donut for vote shares; each slice is a dashed circle offset by the previous ones. */
export function VotingDonut({ slices }: { slices: readonly DonutSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 0;

  return (
    <svg
      aria-label={slices.map((slice) => `${slice.label}: ${slice.value}`).join(", ")}
      className={votingDonutVotingPage.svg}
      role="img"
      viewBox="0 0 128 128"
    >
      <circle className={votingDonutVotingPage.track} cx="64" cy="64" r={RADIUS} strokeWidth="18" />
      {total === 0
        ? null
        : slices.map((slice) => {
            const length = (slice.value / total) * CIRCUMFERENCE;
            const circle = (
              <circle
                className={cn("fill-none", STROKE[slice.tone])}
                cx="64"
                cy="64"
                key={slice.label}
                r={RADIUS}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                strokeWidth="18"
              />
            );
            offset += length;
            return circle;
          })}
    </svg>
  );
}
