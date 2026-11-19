const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SHORT_RANGE_SECONDS = 10;

/** `2.1s` under ten seconds, `41s` up to a minute, `1m05s` after that. */
export function formatDuration(milliseconds: number): string {
  const seconds = milliseconds / MS_PER_SECOND;
  if (seconds < SHORT_RANGE_SECONDS) return `${seconds.toFixed(1)}s`;
  const whole = Math.round(seconds);
  if (whole < SECONDS_PER_MINUTE) return `${whole}s`;
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  return `${minutes}m${String(whole % SECONDS_PER_MINUTE).padStart(2, "0")}s`;
}
