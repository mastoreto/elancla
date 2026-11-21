import { messageForProblemCode } from "@/components/editorial/editorial-status-bar/utils";
import { describeApiFailure } from "@/lib/api/describeApiFailure";

const MESSAGES_BY_CODE: Record<string, string> = {
  stale_version: "Alguien cambió esto mientras lo editabas. Recarga la página.",
  category_in_use: "Un ministerio usa esta categoría. Muévelo a otra antes de borrarla.",
  invalid_category: "La categoría elegida ya no existe. Elige otra.",
  invalid_person: "Una de las personas elegidas ya no existe. Quítala de la lista.",
  invalid_media: "La foto elegida ya no está disponible. Súbela de nuevo.",
};

const DEFAULT_CONFLICT = "No se pudo guardar por un conflicto. Recarga la página.";

async function readProblemCode(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "code" in body) {
      return typeof body.code === "string" ? body.code : null;
    }
  } catch {
    // A failure without a JSON body falls back to the generic status message.
  }
  return null;
}

/** Spanish message for a failed ministry call; the problem `code` tells the 400/409 ones apart. */
export async function describeMinistryFailure(response: Response): Promise<string> {
  const code = await readProblemCode(response);
  const message = code ? (MESSAGES_BY_CODE[code] ?? messageForProblemCode(code)) : null;
  return message ?? describeApiFailure(response.status, DEFAULT_CONFLICT);
}
