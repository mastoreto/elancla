"use client";

import {
  BoardFormRow,
  BoardFormSection,
  BoardInput,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import type { EventFormErrors, EventFormValues } from "../../types";

type EventWhenValues = Pick<
  EventFormValues,
  "startDate" | "startTime" | "endDate" | "endTime" | "allDay"
>;

interface EventWhenFieldsProps {
  values: EventWhenValues;
  errors: EventFormErrors["general"];
  disabled: boolean;
  onChange: (patch: Partial<EventWhenValues>) => void;
}

/** Start and end date, their hours, and whether the event lasts all day (then there are no hours). */
export function EventWhenFields({ values, errors, disabled, onChange }: EventWhenFieldsProps) {
  return (
    <BoardFormSection>
      <BoardSwitchRow
        checked={values.allDay}
        disabled={disabled}
        hint="Sin hora de inicio ni de fin."
        onCheckedChange={(allDay) => onChange({ allDay })}
        title="Todo el día"
      />
      <BoardFormRow>
        <BoardInput
          data-testid="event-start-date"
          disabled={disabled}
          error={errors.startDate}
          id="event-start-date"
          label="Fecha de inicio"
          onChange={(event) => onChange({ startDate: event.target.value })}
          type="date"
          value={values.startDate}
        />
        {values.allDay ? null : (
          <BoardInput
            data-testid="event-start-time"
            disabled={disabled}
            error={errors.startTime}
            id="event-start-time"
            label="Hora de inicio"
            onChange={(event) => onChange({ startTime: event.target.value })}
            type="time"
            value={values.startTime}
          />
        )}
      </BoardFormRow>
      <BoardFormRow>
        <BoardInput
          data-testid="event-end-date"
          disabled={disabled}
          error={errors.endDate}
          hint="Opcional: déjala vacía si termina el mismo día."
          id="event-end-date"
          label="Fecha de fin"
          onChange={(event) => onChange({ endDate: event.target.value })}
          type="date"
          value={values.endDate}
        />
        {values.allDay ? null : (
          <BoardInput
            data-testid="event-end-time"
            disabled={disabled}
            error={errors.endTime}
            id="event-end-time"
            label="Hora de fin"
            onChange={(event) => onChange({ endTime: event.target.value })}
            type="time"
            value={values.endTime}
          />
        )}
      </BoardFormRow>
    </BoardFormSection>
  );
}
