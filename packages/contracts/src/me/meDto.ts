import { z } from "zod";
import { permissionGrantSchema } from "../authz";
import { roleSummaryDto } from "../roles";

export const SIGN_IN_METHODS = ["password", "google"] as const;

export const signInMethodSchema = z.enum(SIGN_IN_METHODS);

/** The authenticated user as the CRM sees it. Nothing else of the account leaves the API. */
export const meDto = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  /** Linked sign-in methods. Never empty. */
  methods: z.array(signInMethodSchema),
  twoFactorEnabled: z.boolean(),
});

export type MeDto = z.infer<typeof meDto>;
export type SignInMethod = z.infer<typeof signInMethodSchema>;

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .max(MAX_PASSWORD_LENGTH);

/** Creates the first password of an account that signed up with Google. */
export const createPasswordBody = z.strictObject({
  newPassword: passwordSchema,
});

export type CreatePasswordBody = z.infer<typeof createPasswordBody>;

/** What the CRM builds its menu and views from: the merged grid of every role of the user. */
export const mePermissionsDto = z.object({
  /** Admin holds every permission, including resources added later. */
  isAdmin: z.boolean(),
  roles: z.array(roleSummaryDto),
  grants: z.array(permissionGrantSchema),
  ministryIds: z.array(z.uuid()),
});

export type MePermissionsDto = z.infer<typeof mePermissionsDto>;
