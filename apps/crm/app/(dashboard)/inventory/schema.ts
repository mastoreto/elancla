import { z } from "zod";

export const INVENTORY_CATEGORIES = [
  "Sonido",
  "Instrumentos",
  "Mobiliario",
  "Tecnología",
  "Cocina",
] as const;

export const INVENTORY_STATUSES = [
  "Bueno",
  "Regular",
  "Prestado",
  "En reparación",
  "Dado de baja",
] as const;

export const inventoryFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  category: z.enum(INVENTORY_CATEGORIES, { error: "Elige una categoría" }),
  location: z.string().trim().min(1, "Indica dónde está"),
  quantity: z
    .string()
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, "Mínimo 1 unidad"),
});

export type InventoryFormErrors = Partial<
  Record<keyof z.infer<typeof inventoryFormSchema>, string>
>;

export const lendFormSchema = z.object({
  borrower: z.string().trim().min(1, "Indica a quién se presta"),
  from: z.string().min(1, "Indica la fecha de salida"),
  returnOn: z.string().min(1, "Indica la fecha de devolución"),
});

export type LendFormErrors = Partial<Record<keyof z.infer<typeof lendFormSchema>, string>>;
