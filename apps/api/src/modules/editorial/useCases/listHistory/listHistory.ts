import type { RevisionSummaryDto } from "@ancla/contracts";
import { listRevisionRows } from "../../data";
import { toRevisionSummaryDto } from "../../mappers";
import { type EditorialInput, entityKeyOf } from "../editorialState";

/** Every revision of the entity, newest first: who wrote, reviewed and published what. */
export async function listHistory(
  input: EditorialInput,
): Promise<RevisionSummaryDto[]> {
  const rows = await listRevisionRows(entityKeyOf(input));
  return rows.map(toRevisionSummaryDto);
}
