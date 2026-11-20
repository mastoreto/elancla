import type { PersonProfileDto } from "@ancla/contracts";
import { db } from "@ancla/db";
import { NotFoundError } from "../../../../core/errors";
import { getStorageEnv } from "../../../../core/storage";
import { findPersonRow } from "../../data";
import { toPersonProfileDto } from "../../mappers";

export async function getPerson(
  organizationId: string,
  id: string,
): Promise<PersonProfileDto> {
  const row = await findPersonRow(db, organizationId, id);
  if (!row) throw new NotFoundError("The person was not found");
  return toPersonProfileDto(row, getStorageEnv().MEDIA_PUBLIC_BASE_URL);
}
