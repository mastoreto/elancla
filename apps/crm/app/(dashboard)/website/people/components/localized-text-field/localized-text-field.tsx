"use client";

import { useState } from "react";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardInput, BoardTextarea } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import type { SiteLocales } from "../../types";

const localizedTextFieldWebsitePage = {
  container: cn("flex flex-col gap-3.5"),
  counter: cn("text-right text-xs text-[var(--tinta-apagada)]"),
  counterOver: cn("font-semibold text-primary"),
};

const TEXTAREA_ROWS = 4;

interface LocalizedTextFieldProps extends SiteLocales {
  /** Prefix of the input ids; unique per field on the page. */
  id: string;
  label: string;
  tabsLabel?: string;
  values: Record<string, string>;
  maxLength: number;
  onChange: (locale: string, value: string) => void;
  multiline?: boolean;
  disabled?: boolean;
  error?: string;
}

/** One text per language behind locale tabs, with the length counter of the language on screen. */
export function LocalizedTextField({
  id,
  label,
  tabsLabel,
  locales,
  defaultLocale,
  values,
  maxLength,
  onChange,
  multiline = false,
  disabled,
  error,
}: LocalizedTextFieldProps) {
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const text = values[activeLocale] ?? "";
  const incompleteLocales = locales.filter((locale) => (values[locale] ?? "").trim() === "");
  const fieldProps = {
    disabled,
    error,
    id: `${id}-${activeLocale}`,
    label,
    onChange: (event: { target: { value: string } }) => onChange(activeLocale, event.target.value),
    value: text,
  };

  return (
    <div className={localizedTextFieldWebsitePage.container}>
      <LocaleTabs
        defaultLocale={defaultLocale}
        incompleteLocales={incompleteLocales}
        label={tabsLabel}
        locales={locales}
        onChange={setActiveLocale}
        value={activeLocale}
      />
      {multiline ? (
        <BoardTextarea {...fieldProps} rows={TEXTAREA_ROWS} />
      ) : (
        <BoardInput {...fieldProps} />
      )}
      <span
        aria-live="polite"
        className={cn(
          localizedTextFieldWebsitePage.counter,
          text.length > maxLength && localizedTextFieldWebsitePage.counterOver,
        )}
      >
        {text.length}/{maxLength}
      </span>
    </div>
  );
}
