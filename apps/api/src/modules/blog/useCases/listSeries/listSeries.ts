import type { SeriesListDto } from "@ancla/contracts";
import { listSeriesRows } from "../../data";
import { toSeriesDto } from "../../mappers";

export async function listSeries(
  organizationId: string,
): Promise<SeriesListDto> {
  return { items: (await listSeriesRows(organizationId)).map(toSeriesDto) };
}
