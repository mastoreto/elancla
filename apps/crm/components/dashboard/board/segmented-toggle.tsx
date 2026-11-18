"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

const segmentedToggleDashboardPage = {
  group: cn(
    "inline-flex gap-[3px] rounded-full bg-secondary p-1 shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
  ),
  option: cn(
    "inline-flex items-center gap-[7px] rounded-full px-3.5 py-2 text-[13px] font-bold text-[var(--tinta-apagada)] transition",
  ),
  optionActive: cn("bg-card text-foreground shadow-(--sombra)"),
  icon: cn("size-4"),
};

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

interface SegmentedToggleProps<T extends string> {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
}

export function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onValueChange,
}: SegmentedToggleProps<T>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would bring its own borders and legend.
    <div aria-label={label} className={segmentedToggleDashboardPage.group} role="group">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            aria-pressed={option.value === value}
            className={cn(
              segmentedToggleDashboardPage.option,
              option.value === value && segmentedToggleDashboardPage.optionActive,
            )}
            key={option.value}
            onClick={() => onValueChange(option.value)}
            type="button"
          >
            <Icon aria-hidden={true} className={segmentedToggleDashboardPage.icon} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
