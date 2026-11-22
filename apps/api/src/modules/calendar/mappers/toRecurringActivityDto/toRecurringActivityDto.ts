import type {
  RecurringActivityDto,
  ServiceKind as ServiceKindDto,
} from "@ancla/contracts";
import type { ServiceKind } from "@ancla/db";
import type { RecurringActivityRow } from "../../data";

const SERVICE_KINDS: Record<ServiceKind, ServiceKindDto> = {
  WORSHIP: "worship",
  BIBLE_SCHOOL: "bibleSchool",
};

export const toServiceKindDto = (
  kind: ServiceKind | null,
): ServiceKindDto | null => (kind === null ? null : SERVICE_KINDS[kind]);

export function toRecurringActivityDto(
  row: RecurringActivityRow,
): RecurringActivityDto {
  return {
    id: row.id,
    scheduleSetId: row.scheduleSetId,
    weekday: row.weekday,
    start: row.start,
    end: row.end,
    placeId: row.placeId,
    serviceKind: toServiceKindDto(row.serviceKind),
    isPublic: row.isPublic,
    isFixed: row.isFixed,
    year: row.year,
    annualReview: row.annualReview,
    needsReview: row.needsReview,
    ministryIds: row.ministries.map(({ ministryId }) => ministryId),
    version: row.version,
    translations: Object.fromEntries(
      row.translations.map(({ locale, title }) => [locale, { title }]),
    ),
  };
}
