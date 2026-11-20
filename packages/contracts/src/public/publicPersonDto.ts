import { z } from "zod";
import { personContext } from "../people";
import { publicLocaleQuery } from "./publicSiteSettingsDto";

/** `context` is required: a person only exists publicly inside the context that shows them. */
export const publicPeopleQuery = publicLocaleQuery.extend({
  context: personContext,
});
export type PublicPeopleQuery = z.infer<typeof publicPeopleQuery>;

/** Public profile. Deliberately no ids (not even the linked user): the contract is public. */
export const publicPersonDto = z.strictObject({
  name: z.string(),
  /** Up to two capitals, computed by the API ("María José Pérez" -> "MP"). */
  initials: z.string(),
  photo: z
    .array(
      z.strictObject({
        url: z.string(),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      }),
    )
    .nullable(),
  bio: z.string().nullable(),
  title: z.string().nullable(),
});
export type PublicPersonDto = z.infer<typeof publicPersonDto>;
