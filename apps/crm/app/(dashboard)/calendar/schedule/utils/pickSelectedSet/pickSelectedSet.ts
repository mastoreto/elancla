import type { ScheduleSetDto } from "@ancla/contracts";

/** The set the URL asks for, else the default one, else the first, else none. */
export function pickSelectedSet(
  sets: readonly ScheduleSetDto[],
  requestedSetId: string | undefined,
): ScheduleSetDto | null {
  return (
    sets.find((set) => set.id === requestedSetId) ??
    sets.find((set) => set.isDefault) ??
    sets[0] ??
    null
  );
}
