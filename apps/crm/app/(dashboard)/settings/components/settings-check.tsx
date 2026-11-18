import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsCheckSettingsPage = {
  label: cn("relative inline-flex cursor-pointer items-center"),
  input: cn("peer sr-only"),
  box: cn(
    "inline-flex size-[22px] items-center justify-center rounded-[7px] text-white transition",
    "shadow-[inset_0_0_0_1.5px_rgba(42,21,26,0.16)]",
    "peer-checked:bg-(image:--grad-granada) peer-checked:shadow-none",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
    "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
  ),
  icon: cn("size-3.5"),
};

interface SettingsCheckProps {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

/** 22 px rose checkbox used by the permission matrix and the notification rules. */
export function SettingsCheck({ checked, label, onCheckedChange }: SettingsCheckProps) {
  return (
    <label className={settingsCheckSettingsPage.label}>
      <input
        aria-label={label}
        checked={checked}
        className={settingsCheckSettingsPage.input}
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
      />
      <span aria-hidden="true" className={settingsCheckSettingsPage.box}>
        <Check className={settingsCheckSettingsPage.icon} strokeWidth={3} />
      </span>
    </label>
  );
}
