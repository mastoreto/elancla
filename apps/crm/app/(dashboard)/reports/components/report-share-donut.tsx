import { cn } from "@/lib/utils";
import type { ReportMinistryShare } from "../types";

const SHARE_COLORS = ["#c23a4e", "#c9a14a", "#2f8f6a", "#7a5bb0", "#b9aab0"] as const;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const reportShareDonutReportsPage = {
  wrapper: cn("flex flex-wrap items-center justify-center gap-5"),
  svg: cn("size-[168px] -rotate-90"),
  track: cn("fill-none stroke-secondary"),
  legend: cn("flex min-w-[200px] flex-col gap-2.5"),
  row: cn("flex items-center gap-2.5 text-[13.5px]"),
  swatch: cn("size-2.5 rounded-[3px]"),
  name: cn("flex-1"),
  value: cn("tabular-nums"),
};

/** Donut of spending share per ministry with its legend. */
export function ReportShareDonut({ shares }: { shares: ReportMinistryShare[] }) {
  const total = shares.reduce((sum, share) => sum + share.percent, 0) || 1;
  let offset = 0;

  return (
    <div className={reportShareDonutReportsPage.wrapper}>
      <svg
        aria-label={shares.map((share) => `${share.label}: ${share.percent} %`).join(", ")}
        className={reportShareDonutReportsPage.svg}
        role="img"
        viewBox="0 0 128 128"
      >
        <circle
          className={reportShareDonutReportsPage.track}
          cx="64"
          cy="64"
          r={RADIUS}
          strokeWidth="18"
        />
        {shares.map((share, index) => {
          const length = (share.percent / total) * CIRCUMFERENCE;
          const circle = (
            <circle
              cx="64"
              cy="64"
              fill="none"
              key={share.label}
              r={RADIUS}
              stroke={SHARE_COLORS[index % SHARE_COLORS.length]}
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={-offset}
              strokeWidth="18"
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className={reportShareDonutReportsPage.legend}>
        {shares.map((share, index) => (
          <div className={reportShareDonutReportsPage.row} key={share.label}>
            <span
              className={reportShareDonutReportsPage.swatch}
              style={{ backgroundColor: SHARE_COLORS[index % SHARE_COLORS.length] }}
            />
            <span className={reportShareDonutReportsPage.name}>{share.label}</span>
            <b className={reportShareDonutReportsPage.value}>{share.percent} %</b>
          </div>
        ))}
      </div>
    </div>
  );
}
