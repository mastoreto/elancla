"use client";

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";

export type WeeklyOffering = {
  week: string;
  received: number;
  goal: number;
};

type WeeklyOfferingsChartProps = {
  data: readonly WeeklyOffering[];
};

const chartConfig = {
  received: { label: "Recibido", color: "var(--chart-1)" },
  goal: { label: "Meta", color: "var(--chart-3)" },
} satisfies ChartConfig;

const THOUSAND = 1000;

function formatThousands(value: number) {
  return `$${Math.round(value / THOUSAND)}k`;
}

export function WeeklyOfferingsChart({ data }: WeeklyOfferingsChartProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader subtitle="Últimas 7 semanas" title="Ofrendas y diezmos" />
      <ChartContainer className="h-64 w-full" config={chartConfig}>
        <AreaChart
          accessibilityLayer={true}
          data={[...data]}
          margin={{ left: 4, right: 8, top: 8 }}
        >
          <defs>
            <linearGradient id="received-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-received)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-received)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis axisLine={false} dataKey="week" tickLine={false} tickMargin={8} />
          <YAxis axisLine={false} tickFormatter={formatThousands} tickLine={false} width={44} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="received"
            fill="url(#received-fill)"
            stroke="var(--color-received)"
            strokeWidth={2.5}
            type="monotone"
          />
          <Line
            dataKey="goal"
            dot={false}
            stroke="var(--color-goal)"
            strokeDasharray="5 5"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </DashboardCard>
  );
}
