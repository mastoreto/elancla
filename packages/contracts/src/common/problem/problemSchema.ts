import { z } from "zod";

/** RFC 9457 Problem Details, as returned by every error response of the API. */
export const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  code: z.string(),
  detail: z.string().optional(),
  requestId: z.string(),
  errors: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});

export type Problem = z.infer<typeof problemSchema>;
