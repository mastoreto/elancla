import type { PersonProfileDto, PersonRoleDto, UpsertPersonProfileBody } from "@ancla/contracts";
import { toNullableText } from "@/app/(dashboard)/website/utils/toNullableText";
import type { PersonFormValues } from "../../types";

export const TEAM_CONTEXT = "team" as const;

const NEW_PERSON_TEAM_ORDER = "0";

function valuesByLocale(
  locales: readonly string[],
  read: (locale: string) => string | null | undefined,
): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, read(locale) ?? ""]));
}

/** Form values for a person to edit, or for a blank profile when `person` is `null`. */
export function toPersonFormValues(
  person: PersonProfileDto | null,
  locales: readonly string[],
): PersonFormValues {
  const teamRole = person?.roles.find((role) => role.context === TEAM_CONTEXT);
  return {
    name: person?.name ?? "",
    photo: person?.photo ?? null,
    userId: person?.userId ?? null,
    bios: valuesByLocale(locales, (locale) => person?.translations[locale]?.bio),
    team: {
      visible: teamRole?.visible ?? true,
      order: String(teamRole?.order ?? NEW_PERSON_TEAM_ORDER),
      titles: valuesByLocale(locales, (locale) => teamRole?.translations[locale]?.title),
    },
    otherRoles: (person?.roles ?? []).filter((role) => role.context !== TEAM_CONTEXT),
  };
}

function toTeamRole(values: PersonFormValues, locales: readonly string[]): PersonRoleDto | null {
  const translations: PersonRoleDto["translations"] = {};
  for (const locale of locales) {
    const title = toNullableText(values.team.titles[locale] ?? "");
    if (title) translations[locale] = { title, stats: [] }; // ponytail: 1.4c edits stats; team roles carry none until then
  }
  // A role without any title is "not on the team": it is left out, which removes an existing one.
  if (Object.keys(translations).length === 0) return null;
  return {
    context: TEAM_CONTEXT,
    visible: values.team.visible,
    order: Number(values.team.order),
    translations,
  };
}

/** The full body the API replaces the profile with; roles of other contexts go back unchanged. */
export function toUpsertPersonBody(
  values: PersonFormValues,
  locales: readonly string[],
): UpsertPersonProfileBody {
  const teamRole = toTeamRole(values, locales);
  return {
    name: values.name.trim(),
    photoId: values.photo?.id ?? null,
    userId: values.userId,
    translations: Object.fromEntries(
      locales.map((locale) => [locale, { bio: toNullableText(values.bios[locale] ?? "") }]),
    ),
    roles: teamRole ? [...values.otherRoles, teamRole] : values.otherRoles,
  };
}
