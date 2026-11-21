import type { MinistryCategoryListDto } from "@ancla/contracts";
import { listCategoryRows } from "../../data";
import { toMinistryCategoryDto } from "../../mappers";

export async function listMinistryCategories(
  organizationId: string,
): Promise<MinistryCategoryListDto> {
  return {
    items: (await listCategoryRows(organizationId)).map(toMinistryCategoryDto),
  };
}
