"use client";

import {
  PERSON_STAT_LABEL_MAX_LENGTH,
  PERSON_STAT_VALUE_MAX_LENGTH,
  PERSON_STATS_MAX_COUNT,
} from "@ancla/contracts";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import type { RoleStatFormValues, SiteLocales } from "../../types";

const roleStatsFieldWebsitePage = {
  container: cn("flex flex-col gap-3.5"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  row: cn("flex items-end gap-2.5"),
  cell: cn("min-w-0 flex-1"),
  remove: cn("mb-1 shrink-0"),
  error: cn("text-xs font-semibold text-primary"),
  icon: cn("size-4"),
};

interface RoleStatsFieldProps extends SiteLocales {
  /** Prefix of the test ids and input ids; unique per role on the page. */
  id: string;
  label: string;
  stats: Record<string, RoleStatFormValues[]>;
  onChange: (stats: Record<string, RoleStatFormValues[]>) => void;
  disabled: boolean;
  error?: string;
}

/** Up to four free-form figures ("Años en la iglesia" / "12") per language, behind locale tabs. */
export function RoleStatsField({
  id,
  label,
  stats,
  onChange,
  disabled,
  error,
  locales,
  defaultLocale,
}: RoleStatsFieldProps) {
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const rows = stats[activeLocale] ?? [];
  const incompleteLocales = locales.filter((locale) => (stats[locale] ?? []).length === 0);

  const setRows = (next: RoleStatFormValues[]) => onChange({ ...stats, [activeLocale]: next });
  const updateRow = (index: number, patch: Partial<RoleStatFormValues>) =>
    setRows(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)));

  return (
    <div className={roleStatsFieldWebsitePage.container} data-testid={`${id}-stats`}>
      <span className={roleStatsFieldWebsitePage.label}>{label}</span>
      <LocaleTabs
        defaultLocale={defaultLocale}
        incompleteLocales={incompleteLocales}
        label={`Idioma de ${label.toLowerCase()}`}
        locales={locales}
        onChange={setActiveLocale}
        value={activeLocale}
      />
      {rows.map((row, index) => (
        // The rows have no identity of their own: they are only ever edited in place or removed.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above
        <div className={roleStatsFieldWebsitePage.row} key={index}>
          <div className={roleStatsFieldWebsitePage.cell}>
            <BoardInput
              data-testid={`${id}-stat-label`}
              disabled={disabled}
              id={`${id}-stat-label-${activeLocale}-${index}`}
              label="Nombre"
              maxLength={PERSON_STAT_LABEL_MAX_LENGTH}
              onChange={(event) => updateRow(index, { label: event.target.value })}
              value={row.label}
            />
          </div>
          <div className={roleStatsFieldWebsitePage.cell}>
            <BoardInput
              data-testid={`${id}-stat-value`}
              disabled={disabled}
              id={`${id}-stat-value-${activeLocale}-${index}`}
              label="Valor"
              maxLength={PERSON_STAT_VALUE_MAX_LENGTH}
              onChange={(event) => updateRow(index, { value: event.target.value })}
              value={row.value}
            />
          </div>
          {disabled ? null : (
            <BoardButton
              aria-label="Quitar estadística"
              className={roleStatsFieldWebsitePage.remove}
              onClick={() => setRows(rows.filter((_, position) => position !== index))}
              variant="ghost"
            >
              <X aria-hidden="true" className={roleStatsFieldWebsitePage.icon} />
            </BoardButton>
          )}
        </div>
      ))}
      {error ? <p className={roleStatsFieldWebsitePage.error}>{error}</p> : null}
      {disabled || rows.length >= PERSON_STATS_MAX_COUNT ? null : (
        <div>
          <BoardButton
            data-testid={`${id}-stat-add`}
            onClick={() => setRows([...rows, { label: "", value: "" }])}
            variant="outline"
          >
            <Plus aria-hidden="true" className={roleStatsFieldWebsitePage.icon} />
            Agregar estadística
          </BoardButton>
        </div>
      )}
    </div>
  );
}
