import {
  PERSON_BIO_MAX_LENGTH,
  PERSON_NAME_MAX_LENGTH,
  PERSON_TITLE_MAX_LENGTH,
} from "@ancla/contracts";
import type { PersonFormErrors, PersonFormValues, SiteLocales } from "../../types";

const MAX_ORDER = 9999;
const ORDER_PATTERN = /^\d{1,4}$/;

function hasAnyTitle(titles: Record<string, string>): boolean {
  return Object.values(titles).some((title) => title.trim() !== "");
}

function teamTitleError(
  titles: Record<string, string>,
  { locales, defaultLocale }: SiteLocales,
): string | undefined {
  if (locales.some((locale) => (titles[locale] ?? "").trim().length > PERSON_TITLE_MAX_LENGTH)) {
    return `Máximo ${PERSON_TITLE_MAX_LENGTH} caracteres.`;
  }
  if (hasAnyTitle(titles) && (titles[defaultLocale] ?? "").trim() === "") {
    return "Escribe el cargo en el idioma obligatorio.";
  }
  return undefined;
}

/** Client-side mirror of the API limits, so the form can point at the field before sending. */
export function validatePersonForm(values: PersonFormValues, site: SiteLocales): PersonFormErrors {
  const errors: PersonFormErrors = {};
  const name = values.name.trim();
  if (name === "") errors.name = "Escribe el nombre.";
  else if (name.length > PERSON_NAME_MAX_LENGTH) {
    errors.name = `Máximo ${PERSON_NAME_MAX_LENGTH} caracteres.`;
  }
  const order = values.team.order.trim();
  if (!ORDER_PATTERN.test(order) || Number(order) > MAX_ORDER) {
    errors.order = `Un número entero entre 0 y ${MAX_ORDER}.`;
  }
  errors.teamTitle = teamTitleError(values.team.titles, site);
  if (site.locales.some((locale) => (values.bios[locale] ?? "").length > PERSON_BIO_MAX_LENGTH)) {
    errors.bio = `Máximo ${PERSON_BIO_MAX_LENGTH} caracteres por idioma.`;
  }
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as PersonFormErrors;
}

export function hasFormErrors(errors: PersonFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
