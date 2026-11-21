import type { EditorialStatusDto } from "@ancla/contracts";
import { notFound } from "next/navigation";
import type { ServerApiClient } from "@/lib/api/createInProcessApiClient";

const NOT_VISIBLE_STATUSES = [400, 403, 404];

/** The editorial status of a ministry profile; one the user cannot see is a 404. */
export async function loadMinistryStatus(
  api: ServerApiClient,
  id: string,
): Promise<EditorialStatusDto> {
  const response = await api.editorial[":type"][":entityId"].$get({
    param: { type: "ministry", entityId: id },
  });
  if (NOT_VISIBLE_STATUSES.includes(response.status)) notFound();
  if (!response.ok) throw new Error(`Could not load the ministry (${response.status})`);
  return response.json();
}
