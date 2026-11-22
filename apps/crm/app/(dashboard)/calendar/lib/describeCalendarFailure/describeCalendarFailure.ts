import { messageForProblemCode } from "@/components/editorial/editorial-status-bar/utils";
import { describeApiFailure } from "@/lib/api/describeApiFailure";

const MESSAGES_BY_CODE: Record<string, string> = {
  stale_version: "Alguien cambió esto mientras lo editabas. Recarga la página.",
  year_exists: "Ese año ya existe.",
  year_not_draft: "Ese año ya está publicado: solo se puede copiar a un año en borrador.",
  year_already_published: "Ese año ya está publicado.",
  invalid_copy_selection:
    "Algún elemento elegido ya no se puede copiar de ese año. Vuelve a elegir.",
  place_in_use: "Un horario o un evento usa este lugar; muévelo a otro primero.",
  schedule_set_in_use: "Una excepción usa este horario como reemplazo; cámbiala o bórrala primero.",
  invalid_schedule_set: "El conjunto elegido ya no existe. Elige otro.",
  exception_date_taken: "Ya hay una excepción para esa fecha. Edita la que existe.",
  event_live: "Un evento publicado no se borra: cancélalo en su lugar.",
  invalid_role: "Uno de los roles elegidos ya no existe. Quítalo de la lista.",
  invalid_user: "Una de las personas elegidas ya no existe. Quítala de la lista.",
  invalid_place: "El lugar elegido ya no existe. Elige otro.",
  invalid_ministry: "Uno de los ministerios elegidos ya no existe. Quítalo o elige otro.",
  not_reviewable: "Solo las actividades fijas con revisión anual se confirman cada año.",
};

const DEFAULT_CONFLICT = "No se pudo completar por un conflicto. Recarga la página.";

async function readProblemCode(response: Response): Promise<string | null> {
  const body: unknown = await response
    .clone()
    .json()
    .catch(() => null);
  if (typeof body !== "object" || body === null) return null;
  const code: unknown = Reflect.get(body, "code");
  return typeof code === "string" ? code : null;
}

/** Spanish message for a failed calendar call; the problem `code` tells the 400/409 ones apart. */
export async function describeCalendarFailure(response: Response): Promise<string> {
  const code = await readProblemCode(response);
  const message = code ? (MESSAGES_BY_CODE[code] ?? messageForProblemCode(code)) : null;
  return message ?? describeApiFailure(response.status, DEFAULT_CONFLICT);
}
