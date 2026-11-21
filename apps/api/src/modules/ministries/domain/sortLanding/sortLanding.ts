interface Sortable {
  showOnLanding: boolean;
  landingOrder: number;
  name: string;
}

/**
 * The mosaic order: the ministries that show on the landing first, by their position; ties and
 * the rest (which the footer still lists) go by name in the served language.
 */
export function sortLanding<Item extends Sortable>(
  items: readonly Item[],
  locale: string,
): Item[] {
  return [...items].sort(
    (a, b) =>
      Number(b.showOnLanding) - Number(a.showOnLanding) ||
      (a.showOnLanding ? a.landingOrder - b.landingOrder : 0) ||
      a.name.localeCompare(b.name, locale),
  );
}
