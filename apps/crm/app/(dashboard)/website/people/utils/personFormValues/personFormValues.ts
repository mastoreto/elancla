import type {
  PersonContext,
  PersonProfileDto,
  PersonRoleDto,
  UpsertPersonProfileBody,
} from "@ancla/contracts";
import { toNullableText } from "@/app/(dashboard)/website/utils/toNullableText";
import type { PersonFormValues, RoleFormValues, RoleStatFormValues } from "../../types";

export const TEAM_CONTEXT = "team" as const;
export const BLOG_AUTHOR_CONTEXT = "blog-author" as const;

const NEW_PERSON_ROLE_ORDER = "0";

const EDITABLE_CONTEXTS: readonly PersonContext[] = [TEAM_CONTEXT, BLOG_AUTHOR_CONTEXT];

function valuesByLocale(
  locales: readonly string[],
  read: (locale: string) => string | null | undefined,
): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, read(locale) ?? ""]));
}

function toRoleFormValues(
  role: PersonRoleDto | undefined,
  locales: readonly string[],
): RoleFormValues {
  return {
    visible: role?.visible ?? true,
    order: String(role?.order ?? NEW_PERSON_ROLE_ORDER),
    titles: valuesByLocale(locales, (locale) => role?.translations[locale]?.title),
    stats: Object.fromEntries(
      locales.map((locale) => [locale, role?.translations[locale]?.stats ?? []]),
    ),
  };
}

/** Form values for a person to edit, or for a blank profile when `person` is `null`. */
export function toPersonFormValues(
  person: PersonProfileDto | null,
  locales: readonly string[],
): PersonFormValues {
  const roleOf = (context: PersonContext) => person?.roles.find((role) => role.context === context);
  return {
    name: person?.name ?? "",
    photo: person?.photo ?? null,
    userId: person?.userId ?? null,
    bios: valuesByLocale(locales, (locale) => person?.translations[locale]?.bio),
    team: toRoleFormValues(roleOf(TEAM_CONTEXT), locales),
    blogAuthor: toRoleFormValues(roleOf(BLOG_AUTHOR_CONTEXT), locales),
    otherRoles: (person?.roles ?? []).filter((role) => !EDITABLE_CONTEXTS.includes(role.context)),
  };
}

/** The stats to send: trimmed, and without the rows left entirely blank. */
export function cleanStats(stats: readonly RoleStatFormValues[]): RoleStatFormValues[] {
  return stats
    .map(({ label, value }) => ({ label: label.trim(), value: value.trim() }))
    .filter(({ label, value }) => label !== "" || value !== "");
}

function toRole(
  context: PersonContext,
  values: RoleFormValues,
  locales: readonly string[],
): PersonRoleDto | null {
  const translations: PersonRoleDto["translations"] = {};
  for (const locale of locales) {
    const title = toNullableText(values.titles[locale] ?? "");
    if (title) translations[locale] = { title, stats: cleanStats(values.stats[locale] ?? []) };
  }
  // A role without any title is "not in that context": it is left out, which removes an existing one.
  if (Object.keys(translations).length === 0) return null;
  return { context, visible: values.visible, order: Number(values.order), translations };
}

/** The full body the API replaces the profile with; roles of other contexts go back unchanged. */
export function toUpsertPersonBody(
  values: PersonFormValues,
  locales: readonly string[],
): UpsertPersonProfileBody {
  const editedRoles = [
    toRole(TEAM_CONTEXT, values.team, locales),
    toRole(BLOG_AUTHOR_CONTEXT, values.blogAuthor, locales),
  ].filter((role): role is PersonRoleDto => role !== null);
  return {
    name: values.name.trim(),
    photoId: values.photo?.id ?? null,
    userId: values.userId,
    translations: Object.fromEntries(
      locales.map((locale) => [locale, { bio: toNullableText(values.bios[locale] ?? "") }]),
    ),
    roles: [...values.otherRoles, ...editedRoles],
  };
}
