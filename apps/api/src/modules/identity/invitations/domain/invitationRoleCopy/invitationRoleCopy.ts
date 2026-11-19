export interface InvitationRoleCopy {
  roleName: string;
  roleDescription: string;
}

const ROLE_DESCRIPTION = "Define lo que podrás ver y hacer";

/** How the invitation email names the roles it grants (the email is in Spanish, like the CRM). */
export function invitationRoleCopy(
  roleNames: readonly string[],
): InvitationRoleCopy {
  return {
    roleName: roleNames.length > 0 ? roleNames.join(", ") : "Sin rol",
    roleDescription: ROLE_DESCRIPTION,
  };
}
