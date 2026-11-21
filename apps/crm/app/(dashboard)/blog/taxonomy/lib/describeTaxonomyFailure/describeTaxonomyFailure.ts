import { describeApiFailure } from "@/lib/api/describeApiFailure";

const MESSAGES_BY_CODE: Record<string, string> = {
  stale_version: "Alguien cambió esto mientras lo editabas. Recarga la página.",
  slug_taken: "Ese slug ya lo usa otro elemento en ese idioma.",
  category_in_use: "Un artículo publicado usa esta categoría. Muévelo a otra antes de borrarla.",
  series_in_use:
    "Un artículo publicado pertenece a esta serie. Quítalo de la serie antes de borrarla.",
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

/** Spanish message for a failed taxonomy call; the 409 ones are told apart by their `code`. */
export async function describeTaxonomyFailure(response: Response): Promise<string> {
  const code = await readProblemCode(response);
  const message = code ? MESSAGES_BY_CODE[code] : undefined;
  return message ?? describeApiFailure(response.status, DEFAULT_CONFLICT);
}
