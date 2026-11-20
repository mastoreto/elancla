import { z } from "zod";
import { mediaFileDto } from "../media";
import { personStatsDto } from "./personStatDto";

/** Where a public profile is shown. Query-string spelling; the API maps it to the DB enum. */
export const PERSON_CONTEXTS = [
  "team",
  "blog-author",
  "preacher",
  "ministry-leader",
] as const;
export const personContext = z.enum(PERSON_CONTEXTS);
export type PersonContext = z.infer<typeof personContext>;

export const PERSON_NAME_MAX_LENGTH = 120;
export const PERSON_BIO_MAX_LENGTH = 600;
export const PERSON_TITLE_MAX_LENGTH = 80;

const bioTranslationDto = z.strictObject({
  bio: z.string().trim().max(PERSON_BIO_MAX_LENGTH).nullable(),
});
const titleTranslationDto = z.strictObject({
  title: z.string().trim().min(1).max(PERSON_TITLE_MAX_LENGTH),
  /** Free-form figures of the role ("estadísticas libres"); empty when there are none. */
  stats: personStatsDto.default([]),
});

const personRoleFields = {
  context: personContext,
  /** Whether the person shows up in that context on the public site. */
  visible: z.boolean(),
  order: z.number().int().min(0).max(9999),
  translations: z.record(z.string(), titleTranslationDto),
};

export const personRoleDto = z.strictObject(personRoleFields);
export type PersonRoleDto = z.infer<typeof personRoleDto>;

/** A person as the CRM edits them. */
export const personProfileDto = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  photo: mediaFileDto.nullable(),
  userId: z.uuid().nullable(),
  translations: z.record(z.string(), bioTranslationDto),
  roles: z.array(personRoleDto),
});
export type PersonProfileDto = z.infer<typeof personProfileDto>;

/**
 * Create and update body (update replaces the whole profile). `roles` replaces the full list;
 * `translations` replaces the locales sent. Locales the organization does not use are rejected (400).
 */
export const upsertPersonProfileBody = z.strictObject({
  name: z.string().trim().min(1).max(PERSON_NAME_MAX_LENGTH),
  photoId: z.uuid().nullable(),
  userId: z.uuid().nullable(),
  translations: z.record(z.string(), bioTranslationDto),
  roles: z
    .array(z.strictObject(personRoleFields))
    .max(PERSON_CONTEXTS.length)
    .refine(
      (roles) =>
        new Set(roles.map((role) => role.context)).size === roles.length,
      { message: "A context can only appear once" },
    ),
});
export type UpsertPersonProfileBody = z.infer<typeof upsertPersonProfileBody>;

export const personProfileListDto = z.object({
  data: z.array(personProfileDto),
});
export type PersonProfileListDto = z.infer<typeof personProfileListDto>;
