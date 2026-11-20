import type { MediaFileDto, PersonRoleDto } from "@ancla/contracts";

/** What the "team" role looks like while it is being edited (strings, as the inputs hold them). */
export interface TeamRoleFormValues {
  visible: boolean;
  order: string;
  /** Title by locale; empty strings are dropped when saving. */
  titles: Record<string, string>;
}

export interface PersonFormValues {
  name: string;
  photo: MediaFileDto | null;
  userId: string | null;
  /** Bio by locale; empty strings are saved as `null`. */
  bios: Record<string, string>;
  team: TeamRoleFormValues;
  /** Roles of other contexts: not editable yet, but sent back untouched so a save never drops them. */
  otherRoles: PersonRoleDto[];
}

export interface PersonFormErrors {
  name?: string;
  order?: string;
  teamTitle?: string;
  bio?: string;
}

export interface SiteLocales {
  locales: readonly string[];
  defaultLocale: string;
}

export interface LinkableUser {
  id: string;
  name: string;
  email: string;
}
