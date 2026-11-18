import { z } from "zod";

export const newPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(150, "El título no puede superar los 150 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(300, "La descripción no puede superar los 300 caracteres"),
  heroImage: z.string().min(1, "La imagen hero es requerida"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  publishedAt: z.string().min(1, "La fecha de publicación es requerida"),
  tags: z.array(z.string().min(1)).min(1, "Agrega al menos un tag"),
  content: z.string().refine((html) => html !== "" && html !== "<p></p>", {
    message: "El contenido no puede estar vacío",
  }),
});

export type NewPostFormValues = z.infer<typeof newPostSchema>;
export type NewPostFormErrors = Partial<Record<keyof NewPostFormValues, string>>;
