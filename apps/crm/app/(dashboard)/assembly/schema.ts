import { z } from "zod";

export const ASSEMBLY_REPORT_SECTIONS = [
  "Resumen financiero",
  "Ingresos y egresos",
  "Presupuesto por ministerio",
  "Proyectos en curso",
] as const;

export const assemblyPublishSchema = z.object({
  title: z.string().trim().min(1, "Ponle un título al informe"),
  assembly: z.string().trim().min(1, "Indica a qué asamblea pertenece"),
  validFrom: z.string().min(1, "Indica cuándo se habilita"),
  validTo: z.string().min(1, "Indica cuándo vence"),
  place: z.string().trim().min(1, "Indica el lugar de la sesión"),
  sections: z.array(z.string()).min(1, "Elige al menos una sección"),
});

export type AssemblyPublishErrors = Partial<
  Record<keyof z.infer<typeof assemblyPublishSchema>, string>
>;
