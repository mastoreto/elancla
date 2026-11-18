import { cn } from "@/lib/utils";
import type { ReportMonthBar } from "../types";

const CHART_HEIGHT = 200;
const BAR_WIDTH = 22;
const GROUP_WIDTH = 78;
const BASE_Y = 226;

const reportBarChartReportsPage = {
  svg: cn("h-60 w-full"),
  axis: cn("stroke-border"),
  income: cn("fill-[#276d4c]"),
  expense: cn("fill-primary"),
  label: cn("fill-[var(--tinta-apagada)] text-xs"),
  legend: cn("mt-2 flex flex-wrap gap-4 text-[12.5px] text-[var(--tinta-suave)]"),
  legendItem: cn("inline-flex items-center gap-[7px]"),
  swatch: cn("size-2.5 rounded-[3px]"),
  swatchIncome: cn("bg-[#276d4c]"),
  swatchExpense: cn("bg-primary"),
};

/** Grouped bars: income vs expense per month, scaled to the largest value. */
export function ReportBarChart({ months }: { months: ReportMonthBar[] }) {
  const peak = Math.max(...months.flatMap((month) => [month.income, month.expense]), 1);
  const scale = (value: number) => (value / peak) * CHART_HEIGHT;
  const width = months.length * GROUP_WIDTH + 24;

  return (
    <div>
      <svg
        aria-label="Ingresos y egresos por mes"
        className={reportBarChartReportsPage.svg}
        role="img"
        viewBox={`0 0 ${width} 250`}
      >
        <line
          className={reportBarChartReportsPage.axis}
          x1="8"
          x2={width - 8}
          y1={BASE_Y}
          y2={BASE_Y}
        />
        {months.map((month, index) => {
          const x = 24 + index * GROUP_WIDTH;
          return (
            <g key={month.month}>
              <rect
                className={reportBarChartReportsPage.income}
                height={scale(month.income)}
                rx="6"
                width={BAR_WIDTH}
                x={x}
                y={BASE_Y - scale(month.income)}
              />
              <rect
                className={reportBarChartReportsPage.expense}
                height={scale(month.expense)}
                rx="6"
                width={BAR_WIDTH}
                x={x + BAR_WIDTH + 6}
                y={BASE_Y - scale(month.expense)}
              />
              <text
                className={reportBarChartReportsPage.label}
                textAnchor="middle"
                x={x + BAR_WIDTH + 3}
                y={BASE_Y + 20}
              >
                {month.month}
              </text>
            </g>
          );
        })}
      </svg>
      <div className={reportBarChartReportsPage.legend}>
        <span className={reportBarChartReportsPage.legendItem}>
          <span
            className={cn(reportBarChartReportsPage.swatch, reportBarChartReportsPage.swatchIncome)}
          />
          Ingresos
        </span>
        <span className={reportBarChartReportsPage.legendItem}>
          <span
            className={cn(
              reportBarChartReportsPage.swatch,
              reportBarChartReportsPage.swatchExpense,
            )}
          />
          Egresos
        </span>
      </div>
    </div>
  );
}
