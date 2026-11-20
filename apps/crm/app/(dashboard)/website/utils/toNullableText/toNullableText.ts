/** The API stores "no value" as `null`: a blank input must not be saved as an empty string. */
export function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
