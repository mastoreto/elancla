"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { boardControlStyles } from "./board-field";

const dateRangePillDashboardPage = {
  icon: cn("size-4 text-[var(--tinta-apagada)]"),
  popover: cn("w-auto p-0"),
};

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return "Rango de fechas";
  const from = format(range.from, "dd/MM");
  return range.to ? `${from} – ${format(range.to, "dd/MM")}` : from;
}

interface DateRangePillProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePill({ value, onChange }: DateRangePillProps) {
  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <button className={boardControlStyles.pill} type="button">
          <CalendarIcon aria-hidden="true" className={dateRangePillDashboardPage.icon} />
          {formatRange(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={dateRangePillDashboardPage.popover}>
        <Calendar
          autoFocus={true}
          mode="range"
          numberOfMonths={2}
          onSelect={onChange}
          selected={value}
        />
      </PopoverContent>
    </Popover>
  );
}
