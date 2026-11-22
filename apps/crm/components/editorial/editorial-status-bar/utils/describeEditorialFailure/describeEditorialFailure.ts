import { describeApiFailure } from "@/lib/api/describeApiFailure";

const INVALID_TRANSITION_MESSAGE =
  "Alguien cambió este contenido mientras tanto. Recarga la página.";

/** Spanish message for the problem `code`s the editorial hooks of each content type can answer. */
const PROBLEM_CODE_MESSAGES: Record<string, string> = {
  slug_taken: "Otro contenido publicado ya usa ese slug. Cámbialo antes de publicar.",
  slug_locked:
    "El slug de un idioma ya publicado no puede cambiar. Restaura el slug que está publicado.",
  invalid_media: "Una imagen del artículo ya no está disponible. Súbela de nuevo.",
  invalid_author: "El autor elegido ya no es un autor del blog. Elige otro.",
  invalid_category: "La categoría elegida ya no existe. Elige otra.",
  invalid_series: "La serie elegida ya no existe. Elige otra o quita la serie.",
  year_not_published:
    "El año de este evento todavía es un borrador: se publica junto con el año completo.",
  year_mismatch: "La fecha de inicio tiene que estar dentro del año del evento.",
  invalid_place: "El lugar elegido ya no existe. Elige otro.",
  invalid_ministry: "Uno de los ministerios elegidos ya no existe. Quítalo o elige otro.",
};

/** The message for a problem `code`, or `null` when the code has none of its own. */
export function messageForProblemCode(code: unknown): string | null {
  return typeof code === "string" ? (PROBLEM_CODE_MESSAGES[code] ?? null) : null;
}

/** The API answers 409/400 for several reasons; the problem `code` says which one it was. */
export async function describeEditorialFailure(response: Response): Promise<string> {
  const problem: unknown = await response
    .clone()
    .json()
    .catch(() => null);
  const code =
    typeof problem === "object" && problem !== null ? Reflect.get(problem, "code") : null;
  return (
    messageForProblemCode(code) ?? describeApiFailure(response.status, INVALID_TRANSITION_MESSAGE)
  );
}
