import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().min(1, "Describe para qué sirve el rol"),
  scope: z.string().trim().min(1, "Indica el alcance"),
  permissions: z.array(z.string()).min(1, "Elige al menos un permiso"),
});

export type RoleFormErrors = Partial<Record<keyof z.infer<typeof roleFormSchema>, string>>;
