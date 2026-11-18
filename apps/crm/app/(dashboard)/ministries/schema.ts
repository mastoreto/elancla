import { z } from "zod";

export const ministryFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().min(1, "La descripción es obligatoria"),
  category: z.enum(["Por edades", "Cultos y Palabra", "Servicio"], {
    error: "Elige una categoría",
  }),
  leaderName: z.string().trim().min(1, "Elige un líder"),
  budget: z
    .string()
    .refine((value) => value === "" || Number(value) >= 0, "El presupuesto no puede ser negativo"),
});

export type MinistryFormErrors = Partial<Record<keyof z.infer<typeof ministryFormSchema>, string>>;
