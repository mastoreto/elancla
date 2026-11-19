import type { MinistryDto } from "@ancla/contracts";

export function toMinistryDto(row: {
  id: string;
  name: string;
  slug: string;
}): MinistryDto {
  return { id: row.id, name: row.name, slug: row.slug };
}
