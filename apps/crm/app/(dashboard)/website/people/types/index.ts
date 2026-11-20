import type { MediaFileDto, PersonRoleDto } from "@ancla/contracts";

/** A free-form figure of a role while it is being edited. */
export interface RoleStatFormValues {
  label: string;
  value: string;
}

/** What a role (team, blog author) looks like while it is being edited (strings, as inputs hold them). */
export interface RoleFormValues {
  visible: boolean;
  order: string;
  /** Title by locale; empty strings are dropped when saving. */
  titles: Record<string, string>;
  /** Stats by locale; rows with both texts empty are dropped when saving. */
  stats: Record<string, RoleStatFormValues[]>;
}

export interface PersonFormValues {
  name: string;
  photo: MediaFileDto | null;
  userId: string | null;
  /** Bio by locale; empty strings are saved as `null`. */
  bios: Record<string, string>;
  team: RoleFormValues;
  blogAuthor: RoleFormValues;
  /** Roles of other contexts: not editable yet, but sent back untouched so a save never drops them. */
  otherRoles: PersonRoleDto[];
}

export interface PersonFormErrors {
  name?: string;
  order?: string;
  teamTitle?: string;
  blogAuthorOrder?: string;
  blogAuthorTitle?: string;
  blogAuthorStats?: string;
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
