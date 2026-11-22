"use client";

import { EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TITLE_MAX_LENGTH } from "@ancla/contracts";
import {
  BoardFormSection,
  BoardInput,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import type { EventTranslationField, EventTranslationValues } from "../../types";

const DESCRIPTION_ROWS = 4;

interface EventTranslationFieldsProps {
  /** Prefix of the field ids; unique per language. */
  locale: string;
  values: EventTranslationValues;
  errors: Partial<Record<EventTranslationField, string>>;
  disabled: boolean;
  onChange: (patch: Partial<EventTranslationValues>) => void;
}

/** The title and description of one language of an event. */
export function EventTranslationFields({
  locale,
  values,
  errors,
  disabled,
  onChange,
}: EventTranslationFieldsProps) {
  return (
    <BoardFormSection>
      <BoardInput
        data-testid="event-title"
        disabled={disabled}
        error={errors.title}
        id={`event-title-${locale}`}
        label="Título"
        maxLength={EVENT_TITLE_MAX_LENGTH}
        onChange={(event) => onChange({ title: event.target.value })}
        value={values.title}
      />
      <BoardTextarea
        data-testid="event-description"
        disabled={disabled}
        error={errors.description}
        hint="Opcional: qué se hará, a quién va dirigido, qué hay que llevar."
        id={`event-description-${locale}`}
        label="Descripción"
        maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
        onChange={(event) => onChange({ description: event.target.value })}
        rows={DESCRIPTION_ROWS}
        value={values.description}
      />
    </BoardFormSection>
  );
}
