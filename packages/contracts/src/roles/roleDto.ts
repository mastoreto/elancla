import { z } from "zod";
import { permissionGrantsSchema } from "../authz";

export const MAX_ROLE_NAME_LENGTH = 80;
export const MAX_ROLE_DESCRIPTION_LENGTH = 300;
/** Upper bound for a custom session duration: one year. */
export const MAX_SESSION_SECONDS = 60 * 60 * 24 * 365;

/** Role summary shown wherever a role is only named (users, /me/permissions). */
export const roleSummaryDto = z.object({ id: z.uuid(), name: z.string() });

export const roleDto = z.object({
  id: z.uuid(),
  /** Set only for seeded roles; `admin` is the one with implicit full access. */
  key: z.string().nullable(),
  name: z.string(),
  description: z.string(),
  persistentSession: z.boolean(),
  /** `null` means the default session length. */
  maxSessionSeconds: z.number().int().positive().nullable(),
  memberCount: z.number().int().nonnegative(),
  grants: permissionGrantsSchema,
});

/** The editable part of a role: PATCH replaces the whole thing. */
export const roleBody = z.strictObject({
  name: z.string().trim().min(1).max(MAX_ROLE_NAME_LENGTH),
  description: z.string().trim().max(MAX_ROLE_DESCRIPTION_LENGTH).default(""),
  persistentSession: z.boolean().default(true),
  maxSessionSeconds: z
    .number()
    .int()
    .positive()
    .max(MAX_SESSION_SECONDS)
    .nullable()
    .default(null),
  grants: permissionGrantsSchema,
});

export const createRoleBody = roleBody;
export const updateRoleBody = roleBody;

export type RoleSummaryDto = z.infer<typeof roleSummaryDto>;
export type RoleDto = z.infer<typeof roleDto>;
export type CreateRoleBody = z.infer<typeof createRoleBody>;
export type UpdateRoleBody = z.infer<typeof updateRoleBody>;
