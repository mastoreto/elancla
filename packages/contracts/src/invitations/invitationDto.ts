import { z } from "zod";
import { passwordSchema } from "../me";

export const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "revoked",
  "expired",
] as const;
export const invitationStatusSchema = z.enum(INVITATION_STATUSES);

const MAX_INVITATION_ASSIGNMENTS = 20;

/** An invitation as the admin list shows it. The token never leaves the API after the email. */
export const invitationDto = z.object({
  id: z.uuid(),
  email: z.string(),
  roleIds: z.array(z.uuid()),
  ministryIds: z.array(z.uuid()),
  status: invitationStatusSchema,
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
});

export const createInvitationBody = z.strictObject({
  email: z.email().max(254),
  roleIds: z.array(z.uuid()).min(1).max(MAX_INVITATION_ASSIGNMENTS),
  ministryIds: z.array(z.uuid()).max(MAX_INVITATION_ASSIGNMENTS).default([]),
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

export type InvitationStatus = z.infer<typeof invitationStatusSchema>;
export type InvitationDto = z.infer<typeof invitationDto>;
export type CreateInvitationBody = z.infer<typeof createInvitationBody>;
export type InvitationPreviewDto = z.infer<typeof invitationPreviewDto>;
export type AcceptInvitationBody = z.infer<typeof acceptInvitationBody>;
