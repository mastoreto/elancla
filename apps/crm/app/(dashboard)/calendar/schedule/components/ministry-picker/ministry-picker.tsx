"use client";

import { ACTIVITY_MINISTRIES_MAX_COUNT } from "@ancla/contracts";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { MinistryOption } from "../../types";
import { MinistryDots } from "../ministry-dots";

const ministryPickerSchedulePage = {
  container: cn("flex flex-col gap-2"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  list: cn("flex flex-wrap gap-x-5 gap-y-2"),
  option: cn("inline-flex cursor-pointer items-center gap-2 text-sm"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
};

interface MinistryPickerProps {
  ministries: readonly MinistryOption[];
  selectedIds: readonly string[];
  onToggle: (ministryId: string) => void;
  error?: string;
}

/** Checkboxes to pick up to six ministries; the first one gives the color of the activity. */
export function MinistryPicker({ ministries, selectedIds, onToggle, error }: MinistryPickerProps) {
  const atLimit = selectedIds.length >= ACTIVITY_MINISTRIES_MAX_COUNT;
  return (
    <fieldset className={ministryPickerSchedulePage.container}>
      <legend className={ministryPickerSchedulePage.label}>Ministerios</legend>
      <div className={ministryPickerSchedulePage.list}>
        {ministries.map((ministry) => {
          const checked = selectedIds.includes(ministry.id);
          return (
            <label
              className={ministryPickerSchedulePage.option}
              htmlFor={`activity-ministry-${ministry.id}`}
              key={ministry.id}
            >
              <Checkbox
                checked={checked}
                id={`activity-ministry-${ministry.id}`}
                disabled={atLimit && !checked}
                onCheckedChange={() => onToggle(ministry.id)}
              />
              <MinistryDots ministries={[ministry]} />
            </label>
          );
        })}
      </div>
      <span className={ministryPickerSchedulePage.hint}>
        Hasta {ACTIVITY_MINISTRIES_MAX_COUNT}. El color de la actividad es el del primero que
        elijas.
      </span>
      {error ? <span className={ministryPickerSchedulePage.error}>{error}</span> : null}
    </fieldset>
  );
}
