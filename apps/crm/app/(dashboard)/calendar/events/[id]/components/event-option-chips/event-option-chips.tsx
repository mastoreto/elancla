"use client";

import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { cn } from "@/lib/utils";
import type { EventOption } from "../../types";
import { toggleSelection } from "../../utils/toggleSelection";

const eventOptionChipsCalendarPage = {
  container: cn("flex flex-col gap-[7px]"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  chips: cn("flex flex-wrap gap-2"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
};

interface EventOptionChipsProps {
  label: string;
  options: readonly EventOption[];
  selectedIds: readonly string[];
  /** Most options that can be selected; no limit when absent. */
  max?: number;
  /** Shown under the chips (what an empty selection means, the limit...). */
  hint?: string;
  /** Shown instead of the chips when there is nothing to choose from. */
  emptyText: string;
  error?: string;
  disabled: boolean;
  onChange: (ids: string[]) => void;
}

/** A multi-selection as a row of toggle chips. */
export function EventOptionChips({
  label,
  options,
  selectedIds,
  max,
  hint,
  emptyText,
  error,
  disabled,
  onChange,
}: EventOptionChipsProps) {
  return (
    <div className={eventOptionChipsCalendarPage.container}>
      <span className={eventOptionChipsCalendarPage.label}>{label}</span>
      {options.length === 0 ? (
        <span className={eventOptionChipsCalendarPage.hint}>{emptyText}</span>
      ) : (
        <div className={eventOptionChipsCalendarPage.chips}>
          {options.map((option) => (
            <FilterChip
              active={selectedIds.includes(option.id)}
              disabled={disabled}
              key={option.id}
              onClick={() => onChange(toggleSelection(selectedIds, option.id, max))}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
      )}
      {hint ? <span className={eventOptionChipsCalendarPage.hint}>{hint}</span> : null}
      {error ? <span className={eventOptionChipsCalendarPage.error}>{error}</span> : null}
    </div>
  );
}
