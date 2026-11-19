import { z } from "zod";
import { ministryDto } from "../ministries";
import { roleSummaryDto } from "../roles";

/** A user as the admin list shows it. */
export const userDto = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  roles: z.array(roleSummaryDto),
  ministries: z.array(ministryDto.pick({ id: true, name: true })),
  /** Most recent session start; `null` when the user never signed in. */
  lastAccessAt: z.iso.datetime().nullable(),
});

const MAX_ASSIGNMENTS = 50;

export const setUserRolesBody = z.strictObject({
  roleIds: z.array(z.uuid()).max(MAX_ASSIGNMENTS),
});

export const setUserMinistriesBody = z.strictObject({
  ministryIds: z.array(z.uuid()).max(MAX_ASSIGNMENTS),
});

export type UserDto = z.infer<typeof userDto>;
export type SetUserRolesBody = z.infer<typeof setUserRolesBody>;
export type SetUserMinistriesBody = z.infer<typeof setUserMinistriesBody>;
