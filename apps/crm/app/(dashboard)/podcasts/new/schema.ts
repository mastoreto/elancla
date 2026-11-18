import { z } from "zod";

export const newPodcastSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(150, "El título no puede superar los 150 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede superar los 500 caracteres"),
  heroImage: z.string().min(1, "La imagen hero es requerida"),
  link: z
    .string()
    .min(1, "El link es requerido")
    .pipe(z.url("Ingresa una URL válida (ej: https://...)")),
  series: z.string(),
  publishedAt: z.string(),
  participants: z.array(z.string().min(1)).min(1, "Agrega al menos un participante"),
});

export type NewPodcastFormValues = z.infer<typeof newPodcastSchema>;
export type NewPodcastFormErrors = Partial<Record<keyof NewPodcastFormValues, string>>;
