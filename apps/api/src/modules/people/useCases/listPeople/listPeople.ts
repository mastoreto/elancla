import type { PersonProfileListDto } from "@ancla/contracts";
import { getStorageEnv } from "../../../../core/storage";
import { listPersonRows } from "../../data";
import { toPersonProfileDto } from "../../mappers";

export async function listPeople(
  organizationId: string,
): Promise<PersonProfileListDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const rows = await listPersonRows(organizationId);
  return { data: rows.map((row) => toPersonProfileDto(row, publicBaseUrl)) };
}
