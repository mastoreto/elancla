import { z } from "zod";

/** Public visit page content. Deliberately no ids: the contract is public and versioned. */
export const publicVisitDto = z.strictObject({
  directions: z.strictObject({
    parking: z.string().nullable(),
    transit: z.string().nullable(),
    accessibility: z.string().nullable(),
  }),
  faqs: z.array(z.strictObject({ question: z.string(), answer: z.string() })),
});
export type PublicVisitDto = z.infer<typeof publicVisitDto>;
