import { z } from "zod";

export const assemblyPublishSchema = z
  .object({
    reportId: z.string().min(1, "Elige el informe a publicar"),
    accessCode: z.string().trim().min(4, "El código necesita al menos 4 caracteres"),
    validFrom: z.string().min(1, "Indica cuándo se habilita"),
    validTo: z.string().min(1, "Indica cuándo vence"),
    address: z.string().trim().min(1, "Indica la dirección del lugar"),
    radius: z.string().min(1),
  })
  .refine((values) => !values.validFrom || !values.validTo || values.validTo > values.validFrom, {
    message: "El cierre debe ser posterior a la apertura",
    path: ["validTo"],
  });

export type AssemblyPublishErrors = Partial<
  Record<keyof z.infer<typeof assemblyPublishSchema>, string>
>;
