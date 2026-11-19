import type { InvitationRole } from "@ancla/contracts";

export interface InvitationRoleCopy {
  roleName: string;
  roleDescription: string;
}

/** How the invitation email names each temporary role (the email is in Spanish, like the CRM). */
export function invitationRoleCopy(role: InvitationRole): InvitationRoleCopy {
  return role === "admin"
    ? {
        roleName: "Administrador",
        roleDescription: "Gestiona usuarios y configuración",
      }
    : { roleName: "Solo lectura", roleDescription: "Consulta la información" };
}
