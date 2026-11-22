"use client";

import type { CalendarYearDto } from "@ancla/contracts";
import { useRouter } from "next/navigation";
import { BoardFormRow, BoardSelect } from "@/components/dashboard/board/board-form";
import { getChurchRoutePath } from "@/lib/church";
import { draftYearsOf } from "../../utils/copyYears";

interface CopyYearPickerProps {
  years: readonly CalendarYearDto[];
  fromYear: number | null;
  toYear: number | null;
}

function copyHref(fromYear: number | null, toYear: number | null): string {
  const params = new URLSearchParams();
  if (fromYear !== null) params.set("from", String(fromYear));
  if (toYear !== null) params.set("to", String(toYear));
  return `${getChurchRoutePath("calendar", "copy")}?${params.toString()}`;
}

/** Source and destination year; changing one reloads the wizard because the source drives the list. */
export function CopyYearPicker({ years, fromYear, toYear }: CopyYearPickerProps) {
  const router = useRouter();
  const sources = years.filter(({ year }) => year !== toYear);
  const toOption = ({ year }: CalendarYearDto) => ({ value: String(year), label: String(year) });

  return (
    <BoardFormRow>
      <BoardSelect
        id="copy-from-year"
        label="Copiar desde el año"
        onValueChange={(value) => router.replace(copyHref(Number(value), toYear))}
        options={sources.map(toOption)}
        placeholder="Elige un año"
        value={fromYear === null ? "" : String(fromYear)}
      />
      <BoardSelect
        hint="Solo los años en borrador reciben copias."
        id="copy-to-year"
        label="Hacia el año"
        onValueChange={(value) => router.replace(copyHref(fromYear, Number(value)))}
        options={draftYearsOf(years).map(toOption)}
        placeholder="Elige un año"
        value={toYear === null ? "" : String(toYear)}
      />
    </BoardFormRow>
  );
}
