"use client";

import {
  MINISTRY_VALUE_DESCRIPTION_MAX_LENGTH,
  MINISTRY_VALUE_TITLE_MAX_LENGTH,
  MINISTRY_VALUES_MAX_COUNT,
  type MinistryValue,
} from "@ancla/contracts";
import { Plus, Trash2 } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { cn } from "@/lib/utils";

const ministryValuesFieldMinistriesPage = {
  container: cn("flex flex-col gap-3"),
  legend: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
  item: cn("flex items-start gap-3 rounded-[20px] bg-[var(--oro-50)] p-3.5"),
  fields: cn("flex min-w-0 flex-1 flex-col gap-3"),
  icon: cn("size-4"),
};

interface MinistryValuesFieldProps {
  /** Prefix of the field ids; unique per language. */
  locale: string;
  values: readonly MinistryValue[];
  error?: string;
  disabled: boolean;
  onChange: (values: MinistryValue[]) => void;
}

/** The values of a ministry in one language: up to six title and description pairs. */
export function MinistryValuesField({
  locale,
  values,
  error,
  disabled,
  onChange,
}: MinistryValuesFieldProps) {
  const patchAt = (index: number, patch: Partial<MinistryValue>) =>
    onChange(values.map((value, at) => (at === index ? { ...value, ...patch } : value)));
  const removeAt = (index: number) => onChange(values.filter((_, at) => at !== index));

  return (
    <div className={ministryValuesFieldMinistriesPage.container} data-testid="ministry-values">
      <span className={ministryValuesFieldMinistriesPage.legend}>Valores (opcional)</span>
      <span className={ministryValuesFieldMinistriesPage.hint}>
        Hasta {MINISTRY_VALUES_MAX_COUNT}: lo que define cómo sirve este ministerio.
      </span>
      {values.map((value, index) => (
        // The list has no stable id and is edited in place, so the position is its identity.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above.
        <div className={ministryValuesFieldMinistriesPage.item} key={index}>
          <div className={ministryValuesFieldMinistriesPage.fields}>
            <BoardInput
              disabled={disabled}
              id={`ministry-value-title-${locale}-${index}`}
              label="Título"
              maxLength={MINISTRY_VALUE_TITLE_MAX_LENGTH}
              onChange={(event) => patchAt(index, { title: event.target.value })}
              value={value.title}
            />
            <BoardInput
              disabled={disabled}
              id={`ministry-value-description-${locale}-${index}`}
              label="Descripción"
              maxLength={MINISTRY_VALUE_DESCRIPTION_MAX_LENGTH}
              onChange={(event) => patchAt(index, { description: event.target.value })}
              value={value.description}
            />
          </div>
          {disabled ? null : (
            <RowIconButton label={`Quitar el valor ${index + 1}`} onClick={() => removeAt(index)}>
              <Trash2 aria-hidden="true" className={ministryValuesFieldMinistriesPage.icon} />
            </RowIconButton>
          )}
        </div>
      ))}
      {error ? <span className={ministryValuesFieldMinistriesPage.error}>{error}</span> : null}
      {disabled || values.length >= MINISTRY_VALUES_MAX_COUNT ? null : (
        <div>
          <BoardButton
            onClick={() => onChange([...values, { title: "", description: "" }])}
            variant="outline"
          >
            <Plus aria-hidden="true" className={ministryValuesFieldMinistriesPage.icon} />
            Agregar valor
          </BoardButton>
        </div>
      )}
    </div>
  );
}
