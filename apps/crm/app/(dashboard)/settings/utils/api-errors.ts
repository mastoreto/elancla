const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

/** Spanish message for a failed API call; `conflict` is the meaning of a 409 in that screen. */
export function describeApiFailure(status: number, conflict: string): string {
  if (status === HTTP_CONFLICT) return conflict;
  if (status === HTTP_FORBIDDEN) return "Tu rol no permite hacer esto.";
  if (status === HTTP_NOT_FOUND) return "Ya no existe. Recarga la página.";
  if (status === HTTP_BAD_REQUEST) return "Revisa los datos e inténtalo de nuevo.";
  return "No se pudo completar la acción. Inténtalo de nuevo.";
}
