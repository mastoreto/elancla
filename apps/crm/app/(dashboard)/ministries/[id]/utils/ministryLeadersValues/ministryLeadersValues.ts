import {
  MINISTRY_LEADERS_MAX_COUNT,
  MINISTRY_ORDER_MAX,
  type MinistryLeadersBody,
  PERSON_TITLE_MAX_LENGTH,
  type PersonProfileDto,
} from "@ancla/contracts";
import type { MinistryLeaderErrors, MinistryLeaderValues } from "../../types";

const ORDER_PATTERN = /^\d{1,4}$/;

/** The people who lead `ministryId`, as rows with a title per enabled language. */
export function toMinistryLeaderRows(
  people: readonly PersonProfileDto[],
  ministryId: string,
  locales: readonly string[],
): MinistryLeaderValues[] {
  return people
    .flatMap((person) =>
      person.ministryRoles
        .filter((role) => role.ministryId === ministryId)
        .map((role) => ({
          personProfileId: person.id,
          visible: role.visible,
          order: role.order,
          titles: Object.fromEntries(
            locales.map((locale) => [locale, role.translations[locale]?.title ?? ""]),
          ),
        })),
    )
    .sort((a, b) => a.order - b.order)
    .map((leader) => ({ ...leader, order: String(leader.order) }));
}

export function blankLeaderRow(locales: readonly string[], order: number): MinistryLeaderValues {
  return {
    personProfileId: "",
    visible: false,
    order: String(order),
    titles: Object.fromEntries(locales.map((locale) => [locale, ""])),
  };
}

/** The next free position after the rows already there. */
export function nextLeaderOrder(rows: readonly MinistryLeaderValues[]): number {
  return rows.reduce((highest, row) => {
    const order = ORDER_PATTERN.test(row.order.trim()) ? Number(row.order) : -1;
    return Math.max(highest, order + 1);
  }, 0);
}

/**
 * The body to send: rows by order, and only the languages that have a title (the default one is
 * validated before).
 */
export function toMinistryLeadersBody(rows: readonly MinistryLeaderValues[]): MinistryLeadersBody {
  return rows
    .map((row) => ({
      personProfileId: row.personProfileId,
      visible: row.visible,
      order: Number(row.order),
      translations: Object.fromEntries(
        Object.entries(row.titles)
          .filter(([, title]) => title.trim() !== "")
          .map(([locale, title]) => [locale, { title: title.trim() }]),
      ),
    }))
    .sort((a, b) => a.order - b.order);
}

/** One error object per row (same index), plus a list-wide message. */
export function validateMinistryLeaders(
  rows: readonly MinistryLeaderValues[],
  defaultLocale: string,
): { rows: MinistryLeaderErrors[]; list?: string } {
  const seen = new Set<string>();
  const rowErrors = rows.map((row): MinistryLeaderErrors => {
    const errors: MinistryLeaderErrors = {};
    if (row.personProfileId === "") errors.personProfileId = "Elige una persona.";
    else if (seen.has(row.personProfileId))
      errors.personProfileId = "Esa persona ya está en la lista.";
    seen.add(row.personProfileId);
    const title = (row.titles[defaultLocale] ?? "").trim();
    if (title === "" || title.length > PERSON_TITLE_MAX_LENGTH) {
      errors.title = `Escribe el cargo (hasta ${PERSON_TITLE_MAX_LENGTH} caracteres).`;
    }
    if (!ORDER_PATTERN.test(row.order.trim()) || Number(row.order) > MINISTRY_ORDER_MAX) {
      errors.order = `Un número entero entre 0 y ${MINISTRY_ORDER_MAX}.`;
    }
    return errors;
  });
  const tooMany = rows.length > MINISTRY_LEADERS_MAX_COUNT;
  return {
    rows: rowErrors,
    ...(tooMany ? { list: `Como máximo ${MINISTRY_LEADERS_MAX_COUNT} responsables.` } : {}),
  };
}

export function hasLeaderErrors(errors: ReturnType<typeof validateMinistryLeaders>): boolean {
  return errors.list !== undefined || errors.rows.some((row) => Object.keys(row).length > 0);
}
