import type { PersonContext, PersonProfileDto } from "@ancla/contracts";

export interface PersonRoleSummary {
  context: PersonContext;
  /** Title in the default language, falling back to any language that has one. */
  title: string | null;
  visible: boolean;
}

/** One entry per role, in the order the API returns them, with the title the list shows. */
export function summarizePersonRoles(
  person: PersonProfileDto,
  defaultLocale: string,
): PersonRoleSummary[] {
  return person.roles.map((role) => ({
    context: role.context,
    title:
      role.translations[defaultLocale]?.title ?? Object.values(role.translations)[0]?.title ?? null,
    visible: role.visible,
  }));
}
