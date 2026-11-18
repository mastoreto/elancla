import { cn } from "@/lib/utils";
import { type PublicReportMonth, publicReportMonths } from "../data/public-report-data";

const CHART_WIDTH = 326;
const CHART_HEIGHT = 134;
const BASELINE_Y = 110.5;
const BAR_WIDTH = 18;
const BAR_GAP = 4;
const GROUP_STEP = 52;
const GROUP_OFFSET = 14;
const LABEL_Y = 128;
// Thousands of UYU per drawing unit, so the tallest bar fits above the baseline.
const VALUE_PER_UNIT = 2;

const publicReportChartInformePage = {
  svg: cn("block h-[134px] w-full"),
  label: cn("fill-[var(--tinta-apagada)] text-[11px]"),
};

function Bar({ x, value, fill }: { x: number; value: number; fill: string }) {
  const height = value / VALUE_PER_UNIT;
  return (
    <rect fill={fill} height={height} rx="4" width={BAR_WIDTH} x={x} y={BASELINE_Y - height} />
  );
}

function MonthGroup({ month, index }: { month: PublicReportMonth; index: number }) {
  const incomeX = GROUP_OFFSET + index * GROUP_STEP;
  const expenseX = incomeX + BAR_WIDTH + BAR_GAP;

  return (
    <g>
      <Bar fill="var(--vida)" value={month.income} x={incomeX} />
      <Bar fill="var(--granada)" value={month.expense} x={expenseX} />
      <text
        className={publicReportChartInformePage.label}
        textAnchor="middle"
        x={incomeX + BAR_WIDTH + BAR_GAP / 2}
        y={LABEL_Y}
      >
        {month.month}
      </text>
    </g>
  );
}

export function PublicReportChart() {
  return (
    <svg
      aria-label="Ingresos y egresos de los últimos seis meses"
      className={publicReportChartInformePage.svg}
      role="img"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
    >
      <line stroke="rgba(42,21,26,.16)" x1="0" x2={CHART_WIDTH} y1={BASELINE_Y} y2={BASELINE_Y} />
      {publicReportMonths.map((month, index) => (
        <MonthGroup index={index} key={month.month} month={month} />
      ))}
    </svg>
  );
}
