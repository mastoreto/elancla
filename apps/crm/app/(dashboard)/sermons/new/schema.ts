import { z } from "zod";
import { isValidYoutubeUrl } from "../utils";

export const sermonFormSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  preacher: z.string().trim().min(1, "El predicador es obligatorio"),
  passage: z.string().trim().min(1, "El pasaje bíblico es obligatorio"),
  summary: z.string().trim(),
  series: z.string(),
  date: z.string().min(1, "La fecha del culto es obligatoria"),
  youtubeUrl: z.string().trim().refine(isValidYoutubeUrl, "Ingresa un link de YouTube válido"),
});

export type SermonFormErrors = Partial<Record<keyof z.infer<typeof sermonFormSchema>, string>>;
