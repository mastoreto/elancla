import { MEDIA_VARIANT_FORMATS } from "@ancla/contracts";
import { z } from "zod";

/** What `finalize` keeps in `media_files.variants` for each generated image. */
export const storedVariantSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.enum(MEDIA_VARIANT_FORMATS),
  key: z.string().min(1),
  size: z.number().int().nonnegative(),
});

export type StoredVariant = z.infer<typeof storedVariantSchema>;

/** Reads the JSON column; anything that is not a valid list reads as "no variants". */
export function parseStoredVariants(value: unknown): StoredVariant[] {
  const result = z.array(storedVariantSchema).safeParse(value);
  return result.success ? result.data : [];
}
