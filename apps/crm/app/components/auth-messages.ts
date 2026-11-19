const GENERIC_MESSAGE = "No se pudo completar la operación. Inténtalo de nuevo.";

/** Spanish copy for the error codes Better Auth and our hooks send back (query param or body). */
const AUTH_MESSAGES: Record<string, string> = {
  // Better Auth redirects `?error=account_not_linked` when Google has no linked account.
  account_not_linked:
    "Esta cuenta de Google aún no está vinculada. Entra con tu contraseña y vincúlala desde Mi cuenta.",
  OAUTH_LINK_ERROR:
    "Esta cuenta de Google aún no está vinculada. Entra con tu contraseña y vincúlala desde Mi cuenta.",
  INVITATION_REQUIRED:
    "No encontramos una invitación para este correo. Pide a un administrador que te invite.",
  PROVIDER_EMAIL_NOT_VERIFIED: "Google no verificó este correo, así que no podemos usarlo.",
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  INVALID_TOKEN: "El enlace no es válido o ya venció. Pide uno nuevo.",
  SESSION_NOT_FRESH: "Por seguridad, vuelve a iniciar sesión para hacer este cambio.",
  INVALID_TWO_FACTOR_COOKIE: "La verificación venció. Vuelve a iniciar sesión.",
  INVALID_CODE: "El código no es correcto.",
  INVALID_BACKUP_CODE: "El código de respaldo no es correcto.",
  INVALID_PASSWORD: "La contraseña no es correcta.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Demasiados intentos. Vuelve a iniciar sesión.",
  ACCOUNT_TEMPORARILY_LOCKED: "Cuenta bloqueada temporalmente por demasiados intentos.",
  PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 12 caracteres.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "Esta cuenta de Google ya está vinculada.",
  LINKING_DIFFERENT_EMAILS_NOT_ALLOWED:
    "La cuenta de Google debe usar el mismo correo que tu cuenta.",
  PROVIDER_NOT_FOUND: "Google no está disponible por ahora.",
  too_many_requests: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
};

/** Maps an error code to Spanish copy; unknown codes get a generic message, never the raw code. */
export function describeAuthError(code: string | null | undefined): string {
  if (!code) return GENERIC_MESSAGE;
  return AUTH_MESSAGES[code] ?? GENERIC_MESSAGE;
}
