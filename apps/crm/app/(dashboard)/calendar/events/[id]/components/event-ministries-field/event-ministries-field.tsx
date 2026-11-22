"use client";

import { EVENT_MINISTRIES_MAX_COUNT } from "@ancla/contracts";
import type { EventOption } from "../../types";
import { EventOptionChips } from "../event-option-chips";

interface EventMinistriesFieldProps {
  ministries: readonly EventOption[];
  selectedIds: readonly string[];
  error?: string;
  disabled: boolean;
  onChange: (ministryIds: string[]) => void;
}

/** The ministries the event belongs to; none means the church in general. */
export function EventMinistriesField({
  ministries,
  selectedIds,
  error,
  disabled,
  onChange,
}: EventMinistriesFieldProps) {
  const hint =
    selectedIds.length === 0
      ? "Ninguno: se muestra como un evento de la iglesia en general."
      : `Hasta ${EVENT_MINISTRIES_MAX_COUNT} ministerios. El color del evento es el del primero.`;
  return (
    <EventOptionChips
      disabled={disabled}
      emptyText="No hay ministerios para elegir: el evento será de la iglesia en general."
      error={error}
      hint={hint}
      label="Ministerios"
      max={EVENT_MINISTRIES_MAX_COUNT}
      onChange={onChange}
      options={ministries}
      selectedIds={selectedIds}
    />
  );
}
