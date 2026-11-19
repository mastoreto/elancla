import { z } from "zod";

/** Minimal ministry (phase 0.4); phase 1.5 extends it. */
export const ministryDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export type MinistryDto = z.infer<typeof ministryDto>;
