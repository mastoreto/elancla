import type { SermonSeriesListDto } from "@ancla/contracts";
import { getStorageEnv } from "../../../../core/storage";
import { listSeriesRows } from "../../data";
import { toSermonSeriesDto } from "../../mappers";
import { loadSeriesSummaries } from "../loadSeriesSummaries";

export async function listSermonSeries(
  organizationId: string,
): Promise<SermonSeriesListDto> {
  const publicBaseUrl = getStorageEnv().MEDIA_PUBLIC_BASE_URL;
  const [rows, summaries] = await Promise.all([
    listSeriesRows(organizationId),
    loadSeriesSummaries(organizationId),
  ]);
  return {
    items: rows.map((row) =>
      toSermonSeriesDto(row, summaries.get(row.id), publicBaseUrl),
    ),
  };
}
