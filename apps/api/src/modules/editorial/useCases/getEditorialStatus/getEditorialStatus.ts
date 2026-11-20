import type { EditorialStatusDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { buildEditorialStatus, type EditorialInput } from "../editorialState";

export function getEditorialStatus(
  input: EditorialInput,
): Promise<EditorialStatusDto> {
  return buildEditorialStatus(db, input);
}
