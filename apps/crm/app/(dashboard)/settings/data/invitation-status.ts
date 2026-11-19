import type { InvitationStatus } from "@ancla/contracts";

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  revoked: "Revocada",
  expired: "Vencida",
};
