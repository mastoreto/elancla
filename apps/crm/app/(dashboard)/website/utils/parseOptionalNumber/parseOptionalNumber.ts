export type OptionalNumber = { valid: true; value: number | null } | { valid: false };

/** Reads a numeric input: blank is a valid "no value" (null); text that is not a number is invalid. */
export function parseOptionalNumber(text: string): OptionalNumber {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return { valid: true, value: null };
  const value = Number(trimmed);
  return Number.isFinite(value) ? { valid: true, value } : { valid: false };
}
