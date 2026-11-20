import type { ServiceTimeDto } from "@ancla/contracts";

/** A row of the editor: `end` is "" while it is not set, and `id` keeps React keys stable. */
export interface ServiceTimeRow {
  id: string;
  kind: ServiceTimeDto["kind"];
  weekday: number;
  start: string;
  end: string;
}

const SUNDAY = 0;
const DEFAULT_START = "10:00";

export function toRows(serviceTimes: readonly ServiceTimeDto[]): ServiceTimeRow[] {
  return serviceTimes.map((slot) => ({
    id: crypto.randomUUID(),
    kind: slot.kind,
    weekday: slot.weekday,
    start: slot.start,
    end: slot.end ?? "",
  }));
}

export function toServiceTimes(rows: readonly ServiceTimeRow[]): ServiceTimeDto[] {
  return rows.map(({ kind, weekday, start, end }) => ({
    kind,
    weekday,
    start,
    end: end === "" ? null : end,
  }));
}

export function newRow(): ServiceTimeRow {
  return {
    id: crypto.randomUUID(),
    kind: "worship",
    weekday: SUNDAY,
    start: DEFAULT_START,
    end: "",
  };
}

/** Mirrors the API rule (`HH:mm` compares as text) so the editor can explain it before saving. */
export function findRowError(row: ServiceTimeRow): string | null {
  if (row.start === "") return "Indica la hora de inicio.";
  if (row.end !== "" && row.end <= row.start) return "La hora de fin debe ser posterior al inicio.";
  return null;
}
