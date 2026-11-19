import type { InvitationRole, InvitationStatus } from "@ancla/contracts";

export const INVITATION_ROLE_LABELS: Record<InvitationRole, string> = {
  admin: "Administrador",
  viewer: "Solo lectura",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  revoked: "Revocada",
  expired: "Vencida",
};
