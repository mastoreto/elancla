const ISO_DURATION = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86_400;

/** `PT1H2M3S` -> 3723. `null` for anything that is not an ISO 8601 duration (`P0D` is 0). */
export function parseIsoDuration(value: string | undefined): number | null {
  if (!value) return null;
  const match = ISO_DURATION.exec(value);
  if (!match) return null;
  const [, days = "0", hours = "0", minutes = "0", seconds = "0"] = match;
  return (
    Number(days) * SECONDS_PER_DAY +
    Number(hours) * SECONDS_PER_HOUR +
    Number(minutes) * SECONDS_PER_MINUTE +
    Number(seconds)
  );
}
