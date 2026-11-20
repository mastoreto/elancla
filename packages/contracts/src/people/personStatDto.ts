import { z } from "zod";

export const PERSON_STAT_LABEL_MAX_LENGTH = 30;
export const PERSON_STAT_VALUE_MAX_LENGTH = 20;
export const PERSON_STATS_MAX_COUNT = 4;

/** A free-form figure on a person's card ("Años en la iglesia" / "12"). */
export const personStatDto = z.strictObject({
  label: z.string().trim().min(1).max(PERSON_STAT_LABEL_MAX_LENGTH),
  value: z.string().trim().min(1).max(PERSON_STAT_VALUE_MAX_LENGTH),
});
export type PersonStatDto = z.infer<typeof personStatDto>;

export const personStatsDto = z
  .array(personStatDto)
  .max(PERSON_STATS_MAX_COUNT);
