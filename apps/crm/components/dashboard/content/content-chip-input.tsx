"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const contentChipInputDashboardPage = {
  container: cn("flex w-full flex-col gap-[7px]"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  row: cn("flex flex-wrap items-center gap-2"),
  chip: cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold"),
  chipTag: cn("bg-(--granada-50) text-primary shadow-[inset_0_0_0_1px_rgba(194,58,78,0.13)]"),
  chipPerson: cn("bg-foreground text-white"),
  remove: cn("inline-flex size-4 items-center justify-center rounded-full hover:bg-black/10"),
  removeIcon: cn("size-3"),
  input: cn(
    "min-w-40 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--tinta-apagada)]",
  ),
  add: cn(
    "inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-[13px] font-semibold shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] hover:bg-secondary",
  ),
  addInput: cn(
    "h-[34px] w-44 rounded-full bg-card px-3.5 text-[13px] shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] outline-none",
  ),
  error: cn("text-xs font-semibold text-primary"),
};

interface ContentChipInputProps {
  id: string;
  label: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  /** "tag" chips are rose and typed inline; "person" chips are dark with an "Agregar" pill. */
  variant: "tag" | "person";
  hint?: string;
  error?: string;
}

/** Removable chips: tags (Enter or comma adds) or people (an "Agregar" pill opens a field). */
export function ContentChipInput({
  id,
  label,
  values,
  onValuesChange,
  variant,
  hint,
  error,
}: ContentChipInputProps) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const commit = () => {
    const value = draft.trim().replace(/,$/, "");
    if (value && !values.some((existing) => existing.toLowerCase() === value.toLowerCase())) {
      onValuesChange([...values, value]);
    }
    setDraft("");
    setAdding(false);
  };

  const input = (
    <input
      aria-label={label}
      // biome-ignore lint/a11y/noAutofocus: the person field only appears after pressing "Agregar".
      autoFocus={variant === "person"}
      className={
        variant === "tag"
          ? contentChipInputDashboardPage.input
          : contentChipInputDashboardPage.addInput
      }
      id={id}
      onBlur={variant === "person" ? commit : undefined}
      onChange={(event) => {
        if (variant === "tag" && event.target.value.endsWith(",")) {
          setDraft(event.target.value);
          commit();
          return;
        }
        setDraft(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
        if (event.key === "Backspace" && !draft && variant === "tag" && values.length > 0) {
          onValuesChange(values.slice(0, -1));
        }
      }}
      placeholder={variant === "tag" ? (hint ?? "") : "Nombre"}
      value={draft}
    />
  );

  return (
    <div className={contentChipInputDashboardPage.container}>
      <span className={contentChipInputDashboardPage.label}>{label}</span>
      <div className={contentChipInputDashboardPage.row}>
        {values.map((value) => (
          <span
            className={cn(
              contentChipInputDashboardPage.chip,
              variant === "tag"
                ? contentChipInputDashboardPage.chipTag
                : contentChipInputDashboardPage.chipPerson,
            )}
            key={value}
          >
            {value}
            <button
              aria-label={`Quitar ${value}`}
              className={contentChipInputDashboardPage.remove}
              onClick={() => onValuesChange(values.filter((item) => item !== value))}
              type="button"
            >
              <X aria-hidden="true" className={contentChipInputDashboardPage.removeIcon} />
            </button>
          </span>
        ))}
        {variant === "tag" ? (
          input
        ) : adding ? (
          input
        ) : (
          <button
            className={contentChipInputDashboardPage.add}
            onClick={() => setAdding(true)}
            type="button"
          >
            <Plus aria-hidden="true" className={contentChipInputDashboardPage.removeIcon} />
            Agregar
          </button>
        )}
      </div>
      {error ? <span className={contentChipInputDashboardPage.error}>{error}</span> : null}
    </div>
  );
}
