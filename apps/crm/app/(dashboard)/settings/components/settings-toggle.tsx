import { cn } from "@/lib/utils";

const settingsToggleSettingsPage = {
  label: cn("relative inline-flex shrink-0 cursor-pointer"),
  input: cn("peer sr-only"),
  track: cn(
    "relative inline-block rounded-full bg-secondary transition",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
    "peer-checked:bg-(image:--grad-granada) peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
    "after:absolute after:top-[3px] after:left-[3px] after:rounded-full after:bg-white after:transition-all",
    "after:shadow-[0_2px_4px_rgba(42,21,26,0.25)]",
  ),
  sizeSmall: cn("h-6 w-10 after:size-[18px] peer-checked:after:left-[19px]"),
  sizeLarge: cn("h-7 w-[46px] after:size-[22px] peer-checked:after:left-[21px]"),
};

interface SettingsToggleProps {
  checked: boolean;
  label: string;
  size?: "small" | "large";
  onCheckedChange: (checked: boolean) => void;
}

/** Pill switch from the settings boards (40 px in the matrix, 46 px for the daily summary). */
export function SettingsToggle({
  checked,
  label,
  size = "small",
  onCheckedChange,
}: SettingsToggleProps) {
  return (
    <label className={settingsToggleSettingsPage.label}>
      <input
        aria-label={label}
        checked={checked}
        className={settingsToggleSettingsPage.input}
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={cn(
          settingsToggleSettingsPage.track,
          size === "small"
            ? settingsToggleSettingsPage.sizeSmall
            : settingsToggleSettingsPage.sizeLarge,
        )}
      />
    </label>
  );
}
