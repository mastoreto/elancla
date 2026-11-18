import { z } from "zod";

export const participantSchema = z.object({
  /** Present only for platform members. */
  hostId: z.string().optional(),
  name: z.string().min(1),
  isExternal: z.boolean(),
});

export type PodcastParticipant = z.infer<typeof participantSchema>;

export const newPodcastSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(150, "El título no puede superar los 150 caracteres"),

  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede superar los 500 caracteres"),

  heroImage: z.string().min(1, "La imagen hero es requerida"),

  link: z.string().min(1, "El link es requerido").url("Ingresa una URL válida (ej: https://...)"),

  participants: z.array(participantSchema).min(1, "Agrega al menos un participante"),
});

export type NewPodcastFormValues = z.infer<typeof newPodcastSchema>;
