/** Index = `Date#getDay` (0 = Sunday), the same convention as the calendar contracts. */
export const WEEKDAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

export const WEEKDAY_SHORT_NAMES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] as const;

export const MONTH_SHORT_NAMES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;
