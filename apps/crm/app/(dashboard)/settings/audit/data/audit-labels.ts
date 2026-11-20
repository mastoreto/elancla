import { AUDIT_ACTIONS, type AuditAction, type AuditOutcome } from "@ancla/contracts";
import type { StatusPillTone } from "@/components/dashboard/board/status-pill";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  [AUDIT_ACTIONS.auth.loginSucceeded]: "Inicio de sesión",
  [AUDIT_ACTIONS.auth.loginFailed]: "Inicio de sesión fallido",
  [AUDIT_ACTIONS.auth.loginTwoFactorRequired]: "Inicio de sesión: falta el segundo paso",
  [AUDIT_ACTIONS.auth.twoFactorVerified]: "Segundo paso verificado",
  [AUDIT_ACTIONS.auth.twoFactorFailed]: "Segundo paso fallido",
  [AUDIT_ACTIONS.auth.twoFactorEnabled]: "Verificación en dos pasos activada",
  [AUDIT_ACTIONS.auth.twoFactorDisabled]: "Verificación en dos pasos desactivada",
  [AUDIT_ACTIONS.auth.backupCodeUsed]: "Código de respaldo usado",
  [AUDIT_ACTIONS.auth.backupCodeFailed]: "Código de respaldo fallido",
  [AUDIT_ACTIONS.auth.passwordResetRequested]: "Restablecimiento de clave solicitado",
  [AUDIT_ACTIONS.auth.passwordResetCompleted]: "Clave restablecida",
  [AUDIT_ACTIONS.auth.passwordChanged]: "Clave cambiada",
  [AUDIT_ACTIONS.auth.passwordCreated]: "Clave creada",
  [AUDIT_ACTIONS.auth.accountLinked]: "Cuenta vinculada",
  [AUDIT_ACTIONS.permission.denied]: "Permiso denegado",
  [AUDIT_ACTIONS.role.created]: "Rol creado",
  [AUDIT_ACTIONS.role.updated]: "Rol editado",
  [AUDIT_ACTIONS.role.deleted]: "Rol eliminado",
  [AUDIT_ACTIONS.user.rolesChanged]: "Roles de un usuario cambiados",
  [AUDIT_ACTIONS.user.ministriesChanged]: "Ministerios de un usuario cambiados",
  [AUDIT_ACTIONS.invitation.created]: "Invitación creada",
  [AUDIT_ACTIONS.invitation.resent]: "Invitación reenviada",
  [AUDIT_ACTIONS.invitation.revoked]: "Invitación revocada",
  [AUDIT_ACTIONS.invitation.accepted]: "Invitación aceptada",
  [AUDIT_ACTIONS.siteApiKey.created]: "Clave del sitio creada",
  [AUDIT_ACTIONS.siteApiKey.revoked]: "Clave del sitio revocada",
  [AUDIT_ACTIONS.editorial.draftSaved]: "Borrador guardado",
  [AUDIT_ACTIONS.editorial.submitted]: "Contenido enviado a revisión",
  [AUDIT_ACTIONS.editorial.published]: "Contenido publicado",
  [AUDIT_ACTIONS.editorial.approved]: "Contenido aprobado y publicado",
  [AUDIT_ACTIONS.editorial.changesRequested]: "Cambios pedidos en una revisión",
  [AUDIT_ACTIONS.editorial.paused]: "Contenido pausado",
  [AUDIT_ACTIONS.editorial.resumed]: "Contenido reanudado",
  [AUDIT_ACTIONS.editorial.settingsUpdated]: "Revisión editorial configurada",
  [AUDIT_ACTIONS.site.settingsUpdated]: "Configuración del sitio actualizada",
  [AUDIT_ACTIONS.personProfile.created]: "Persona del sitio creada",
  [AUDIT_ACTIONS.personProfile.updated]: "Persona del sitio editada",
  [AUDIT_ACTIONS.personProfile.deleted]: "Persona del sitio eliminada",
  [AUDIT_ACTIONS.visit.updated]: "Página Visítanos actualizada",
  [AUDIT_ACTIONS.media.uploadRequested]: "Subida de archivo solicitada",
  [AUDIT_ACTIONS.media.finalized]: "Archivo verificado",
  [AUDIT_ACTIONS.media.rejected]: "Archivo rechazado",
  [AUDIT_ACTIONS.media.downloadIssued]: "Descarga de archivo emitida",
  [AUDIT_ACTIONS.media.purged]: "Subida abandonada eliminada",
};

export const AUDIT_OUTCOME_LABELS: Record<AuditOutcome, string> = {
  success: "Correcto",
  denied: "Denegado",
  failure: "Fallido",
};

export const AUDIT_OUTCOME_TONES: Record<AuditOutcome, StatusPillTone> = {
  success: "green",
  denied: "gold",
  failure: "rose",
};

/** Sorted by label so the filter reads alphabetically. */
export const AUDIT_ACTION_OPTIONS = Object.entries(AUDIT_ACTION_LABELS)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label, "es"));

/** The API stores any string; an action added to the API but not here still shows readable. */
export function labelOfAction(action: string): string {
  return (AUDIT_ACTION_LABELS as Record<string, string>)[action] ?? action;
}
