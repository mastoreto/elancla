import {
  PERSON_BIO_MAX_LENGTH,
  PERSON_NAME_MAX_LENGTH,
  PERSON_STAT_LABEL_MAX_LENGTH,
  PERSON_STAT_VALUE_MAX_LENGTH,
  PERSON_STATS_MAX_COUNT,
  PERSON_TITLE_MAX_LENGTH,
} from "@ancla/contracts";
import type { PersonFormErrors, PersonFormValues, RoleFormValues, SiteLocales } from "../../types";
import { cleanStats } from "../personFormValues";

const MAX_ORDER = 9999;
const ORDER_PATTERN = /^\d{1,4}$/;

function hasAnyTitle(titles: Record<string, string>): boolean {
  return Object.values(titles).some((title) => title.trim() !== "");
}

function roleTitleError(
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

function orderError(order: string): string | undefined {
  const trimmed = order.trim();
  if (!ORDER_PATTERN.test(trimmed) || Number(trimmed) > MAX_ORDER) {
    return `Un número entero entre 0 y ${MAX_ORDER}.`;
  }
  return undefined;
}

/** Why the stats of a role cannot be saved; `undefined` when they are fine. */
function roleStatsError(role: RoleFormValues, { locales }: SiteLocales): string | undefined {
  for (const locale of locales) {
    const stats = cleanStats(role.stats[locale] ?? []);
    if (stats.length === 0) continue;
    if (stats.length > PERSON_STATS_MAX_COUNT) {
      return `Máximo ${PERSON_STATS_MAX_COUNT} estadísticas por idioma.`;
    }
    if (stats.some(({ label, value }) => label === "" || value === "")) {
      return "Cada estadística necesita nombre y valor.";
    }
    if (
      stats.some(
        ({ label, value }) =>
          label.length > PERSON_STAT_LABEL_MAX_LENGTH ||
          value.length > PERSON_STAT_VALUE_MAX_LENGTH,
      )
    ) {
      return `El nombre admite hasta ${PERSON_STAT_LABEL_MAX_LENGTH} caracteres y el valor hasta ${PERSON_STAT_VALUE_MAX_LENGTH}.`;
    }
    if ((role.titles[locale] ?? "").trim() === "") {
      return "Escribe el cargo en ese idioma antes de agregar estadísticas.";
    }
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
  errors.order = orderError(values.team.order);
  errors.teamTitle = roleTitleError(values.team.titles, site);
  errors.blogAuthorOrder = orderError(values.blogAuthor.order);
  errors.blogAuthorTitle = roleTitleError(values.blogAuthor.titles, site);
  errors.blogAuthorStats = roleStatsError(values.blogAuthor, site);
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
