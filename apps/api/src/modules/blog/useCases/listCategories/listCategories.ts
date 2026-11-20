import type { CategoryListDto } from "@ancla/contracts";
import { listCategoryRows } from "../../data";
import { toCategoryDto } from "../../mappers";

export async function listCategories(
  organizationId: string,
): Promise<CategoryListDto> {
  return { items: (await listCategoryRows(organizationId)).map(toCategoryDto) };
}
