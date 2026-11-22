/** What the resolution needs from a schedule set; dates are "YYYY-MM-DD". */
export interface ResolvableSet {
  id: string;
  validFrom: string | null;
  validTo: string | null;
  isDefault: boolean;
  forcedActive: boolean;
}

export interface ResolvableException {
  date: string;
  /** `null` means "no meeting that day". */
  replacementSetId: string | null;
}

export interface ScheduleResolution<
  TSet extends ResolvableSet,
  TException extends ResolvableException,
> {
  set: TSet | null;
  exception: TException | null;
}

const hasWindow = (set: ResolvableSet): boolean =>
  set.validFrom !== null || set.validTo !== null;

const covers = (set: ResolvableSet, date: string): boolean =>
  (set.validFrom === null || set.validFrom <= date) &&
  (set.validTo === null || date <= set.validTo);

/** Days the window spans; an open-ended one counts as infinite, so any closed window beats it. */
function windowLength(set: ResolvableSet): number {
  if (set.validFrom === null || set.validTo === null)
    return Number.POSITIVE_INFINITY;
  const from = Date.parse(`${set.validFrom}T00:00:00Z`);
  const to = Date.parse(`${set.validTo}T00:00:00Z`);
  return to - from;
}

function shortestWindow<TSet extends ResolvableSet>(sets: TSet[]): TSet | null {
  let best: TSet | null = null;
  for (const set of sets) {
    // `<` keeps the first of equals: the caller passes the sets in their display order.
    if (best === null || windowLength(set) < windowLength(best)) best = set;
  }
  return best;
}

/**
 * Which schedule set governs a date. In order: the exception of that date, the manually forced
 * set, the set whose validity covers the date (the one with the shortest window when several do),
 * and the default set. A set without any validity bound only takes part as forced or default.
 * `set: null` with an exception means "no meeting"; with no exception it means nothing is set up.
 */
export function resolveScheduleForDate<
  TSet extends ResolvableSet,
  TException extends ResolvableException,
>(input: {
  date: string;
  sets: readonly TSet[];
  exceptions: readonly TException[];
}): ScheduleResolution<TSet, TException> {
  const { date, sets, exceptions } = input;
  const exception = exceptions.find((candidate) => candidate.date === date);
  if (exception) {
    const replacement =
      exception.replacementSetId === null
        ? null
        : (sets.find((set) => set.id === exception.replacementSetId) ?? null);
    return { set: replacement, exception };
  }
  const forced = sets.find((set) => set.forcedActive);
  if (forced) return { set: forced, exception: null };
  const inWindow = sets.filter((set) => hasWindow(set) && covers(set, date));
  const windowed = shortestWindow(inWindow);
  if (windowed) return { set: windowed, exception: null };
  return { set: sets.find((set) => set.isDefault) ?? null, exception: null };
}
