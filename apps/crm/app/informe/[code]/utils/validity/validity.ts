const VALIDITY_END_PATTERN = /[–-]\s*(\d{1,2}:\d{2})\s*$/;

/** "Hasta las 14:00" from a validity like "Hoy 10:30 – 14:00"; null when there is no end time. */
export function getValidityEndLabel(validity: string): string | null {
  const match = VALIDITY_END_PATTERN.exec(validity);
  return match ? `Hasta las ${match[1]}` : null;
}
