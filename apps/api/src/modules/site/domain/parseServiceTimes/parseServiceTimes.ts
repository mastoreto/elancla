import { type ServiceTimeDto, serviceTimeDto } from "@ancla/contracts";

/** The stored JSON as a list of valid slots; anything malformed is dropped instead of served. */
export function parseServiceTimes(stored: unknown): ServiceTimeDto[] {
  if (!Array.isArray(stored)) return [];
  return stored.flatMap((slot) => {
    const parsed = serviceTimeDto.safeParse(slot);
    return parsed.success ? [parsed.data] : [];
  });
}
