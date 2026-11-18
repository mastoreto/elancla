import { cn } from "@/lib/utils";

const FILLS = {
  green: cn("bg-[linear-gradient(90deg,#4a9b70,#2f7d57)]"),
  rose: cn("bg-primary"),
  gold: cn("bg-[var(--oro)]"),
} satisfies Record<string, string>;

export type ProgressBarTone = keyof typeof FILLS;

const progressBarDashboardPage = {
  track: cn(
    "block h-2 overflow-hidden rounded-full bg-secondary shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
  ),
  fill: cn("block h-full rounded-full"),
};

interface ProgressBarProps {
  /** 0 to 100. */
  value: number;
  tone?: ProgressBarTone;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, tone = "green", label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <span
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clamped}
      className={cn(progressBarDashboardPage.track, className)}
      role="progressbar"
    >
      <span
        className={cn(progressBarDashboardPage.fill, FILLS[tone])}
        style={{ width: `${clamped}%` }}
      />
    </span>
  );
}
