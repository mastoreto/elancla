import { z } from "zod";
import { passwordSchema } from "../me";

/** Temporary flat roles (phase 0.4 replaces them with RBAC). */
export const INVITATION_ROLES = ["admin", "viewer"] as const;
export const invitationRoleSchema = z.enum(INVITATION_ROLES);

export const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "revoked",
  "expired",
] as const;
export const invitationStatusSchema = z.enum(INVITATION_STATUSES);

/** An invitation as the admin list shows it. The token never leaves the API after the email. */
export const invitationDto = z.object({
  id: z.uuid(),
  email: z.string(),
  role: invitationRoleSchema,
  status: invitationStatusSchema,
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const createInvitationBody = z.strictObject({
  email: z.email().max(254),
  role: invitationRoleSchema.default("viewer"),
});

/** What the public link page may know: a masked email, never the full address. */
export const invitationPreviewDto = z.object({
  maskedEmail: z.string(),
  organizationName: z.string(),
  expiresAt: z.iso.datetime(),
});

export const acceptInvitationBody = z.strictObject({
  name: z.string().trim().min(1).max(120),
  password: passwordSchema,
});

export type InvitationRole = z.infer<typeof invitationRoleSchema>;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;
export type InvitationDto = z.infer<typeof invitationDto>;
export type CreateInvitationBody = z.infer<typeof createInvitationBody>;
export type InvitationPreviewDto = z.infer<typeof invitationPreviewDto>;
export type AcceptInvitationBody = z.infer<typeof acceptInvitationBody>;
