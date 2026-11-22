import type { CalendarYearDto } from "@ancla/contracts";
import type { CalendarYearRow } from "../../data";

export function toCalendarYearDto(row: CalendarYearRow): CalendarYearDto {
  return {
    year: row.year,
    status: row.status === "PUBLISHED" ? "published" : "draft",
    publishedAt: row.publishedAt?.toISOString() ?? null,
    publishedById: row.publishedById,
  };
}
