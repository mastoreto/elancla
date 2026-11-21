import type { MinistrySnapshot } from "@ancla/contracts";

const DEFAULT_LOCALE = "es";

/**
 * A valid ministry profile for the default language. The slug derives from `entityId` so it is
 * stable across the drafts of one ministry (published slugs are locked) and unique across them.
 */
export function validMinistrySnapshot(
  entityId: string,
  name = "Ministerio de prueba",
): MinistrySnapshot {
  return {
    translations: {
      [DEFAULT_LOCALE]: {
        name,
        slug: `test-${entityId}`,
        tagline: `Frase de ${name}`,
        about: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: name }] },
          ],
        },
        values: [],
      },
    },
  };
}

/** The default-language name of a snapshot, to compare what a revision holds. */
export function nameOfSnapshot(snapshot: unknown): string | undefined {
  const { translations } = snapshot as MinistrySnapshot;
  return translations[DEFAULT_LOCALE]?.name;
}
