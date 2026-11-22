import { cn } from "@/lib/utils";

const optionChecklistCalendarPage = {
  fieldset: cn("flex min-w-0 flex-col gap-2"),
  legend: cn("text-[13px] font-bold text-foreground"),
  list: cn("flex max-h-44 flex-col gap-1 overflow-y-auto rounded-[18px] bg-secondary p-2"),
  option: cn(
    "flex cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-card",
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
  ),
  input: cn("mt-0.5 size-4 shrink-0 accent-primary"),
  text: cn("flex min-w-0 flex-col"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  empty: cn("px-2.5 py-2 text-[13px] text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
};

export interface ChecklistOption {
  value: string;
  label: string;
  hint?: string;
}

interface OptionChecklistProps {
  legend: string;
  options: readonly ChecklistOption[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  emptyText: string;
  disabled?: boolean;
  error?: string;
}

/** A labelled group of checkboxes that edits a list of ids (roles or users). */
export function OptionChecklist({
  legend,
  options,
  selected,
  onChange,
  emptyText,
  disabled,
  error,
}: OptionChecklistProps) {
  const toggle = (value: string, checked: boolean) =>
    onChange(checked ? [...selected, value] : selected.filter((item) => item !== value));

  return (
    <fieldset className={optionChecklistCalendarPage.fieldset}>
      <legend className={optionChecklistCalendarPage.legend}>{legend}</legend>
      <div className={optionChecklistCalendarPage.list}>
        {options.length === 0 ? (
          <p className={optionChecklistCalendarPage.empty}>{emptyText}</p>
        ) : null}
        {options.map((option) => (
          <label className={optionChecklistCalendarPage.option} key={option.value}>
            <input
              checked={selected.includes(option.value)}
              className={optionChecklistCalendarPage.input}
              disabled={disabled}
              onChange={(event) => toggle(option.value, event.target.checked)}
              type="checkbox"
            />
            <span className={optionChecklistCalendarPage.text}>
              <span>{option.label}</span>
              {option.hint ? (
                <span className={optionChecklistCalendarPage.hint}>{option.hint}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {error ? <span className={optionChecklistCalendarPage.error}>{error}</span> : null}
    </fieldset>
  );
}
