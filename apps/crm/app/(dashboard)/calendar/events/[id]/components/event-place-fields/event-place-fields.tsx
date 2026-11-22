"use client";

import {
  EVENT_EXTERNAL_ADDRESS_MAX_LENGTH,
  EVENT_PLACE_MODES,
  type EventPlaceMode,
} from "@ancla/contracts";
import { BoardFormSection, BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import type { EventFormErrors, EventFormValues, EventOption } from "../../types";

type EventPlaceValues = Pick<EventFormValues, "placeMode" | "placeId" | "externalAddress">;

const PLACE_MODE_LABELS: Record<EventPlaceMode, string> = {
  place: "Un lugar de la lista",
  tbc: "Por confirmar",
  external: "Otra dirección",
};

const PLACE_MODE_OPTIONS = EVENT_PLACE_MODES.map((mode) => ({
  value: mode,
  label: PLACE_MODE_LABELS[mode],
}));

interface EventPlaceFieldsProps {
  values: EventPlaceValues;
  errors: EventFormErrors["general"];
  places: readonly EventOption[];
  disabled: boolean;
  onChange: (patch: Partial<EventPlaceValues>) => void;
}

/** Where the event is: a saved place, "to be confirmed", or a free address. */
export function EventPlaceFields({
  values,
  errors,
  places,
  disabled,
  onChange,
}: EventPlaceFieldsProps) {
  return (
    <BoardFormSection>
      <BoardSelect
        disabled={disabled}
        id="event-place-mode"
        label="Lugar"
        onValueChange={(placeMode) => onChange({ placeMode: placeMode as EventPlaceMode })}
        options={PLACE_MODE_OPTIONS}
        value={values.placeMode}
      />
      {values.placeMode === "place" ? (
        <BoardSelect
          disabled={disabled}
          error={errors.placeId}
          hint={
            places.length === 0 ? "Aún no hay lugares: créalos en Calendario > Lugares." : undefined
          }
          id="event-place"
          label="Lugar de la lista"
          onValueChange={(placeId) => onChange({ placeId })}
          options={places.map((place) => ({ value: place.id, label: place.label }))}
          placeholder="Elige un lugar"
          value={values.placeId}
        />
      ) : null}
      {values.placeMode === "external" ? (
        <BoardInput
          data-testid="event-external-address"
          disabled={disabled}
          error={errors.externalAddress}
          id="event-external-address"
          label="Dirección"
          maxLength={EVENT_EXTERNAL_ADDRESS_MAX_LENGTH}
          onChange={(event) => onChange({ externalAddress: event.target.value })}
          value={values.externalAddress}
        />
      ) : null}
    </BoardFormSection>
  );
}
