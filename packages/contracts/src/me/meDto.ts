import { z } from "zod";

/** The authenticated user as the CRM sees it. Nothing else of the account leaves the API. */
export const meDto = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
});

export type MeDto = z.infer<typeof meDto>;
