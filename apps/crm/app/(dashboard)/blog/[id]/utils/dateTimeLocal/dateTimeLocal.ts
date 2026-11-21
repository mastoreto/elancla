const PAD_LENGTH = 2;

function pad(value: number): string {
  return String(value).padStart(PAD_LENGTH, "0");
}

/** An ISO datetime as the browser's `datetime-local` input reads it (local time, no seconds). */
export function toDateTimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** The `datetime-local` value as an ISO datetime with offset; `undefined` when it is empty. */
export function fromDateTimeLocal(local: string): string | undefined {
  if (local.trim() === "") return undefined;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Today as `YYYY-MM-DD` in the browser's time zone. */
export function todayInputValue(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
