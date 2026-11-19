import { z } from "zod";

export const healthDto = z.object({
  status: z.enum(["ok", "degraded"]),
});

export type HealthDto = z.infer<typeof healthDto>;
