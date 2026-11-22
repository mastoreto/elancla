import type { CalendarYearDto } from "@ancla/contracts";

export interface CopyYears {
  fromYear: number | null;
  toYear: number | null;
}

interface RequestedYears {
  from: number | undefined;
  to: number | undefined;
}

/** Years that can receive a copy: only the drafts. */
export function draftYearsOf(years: readonly CalendarYearDto[]): CalendarYearDto[] {
  return years.filter((year) => year.status === "draft");
}

function latestOf(years: readonly number[]): number | null {
  return years.length === 0 ? null : Math.max(...years);
}

/**
 * The years the wizard starts with. The destination is the requested draft year, else the latest
 * draft. The source is the requested year (if it exists and is not the destination), else the
 * latest year before the destination, else the latest other year.
 */
export function pickCopyYears(
  years: readonly CalendarYearDto[],
  requested: RequestedYears,
): CopyYears {
  const drafts = draftYearsOf(years).map(({ year }) => year);
  const toYear =
    requested.to !== undefined && drafts.includes(requested.to) ? requested.to : latestOf(drafts);
  const sources = years.map(({ year }) => year).filter((year) => year !== toYear);
  if (requested.from !== undefined && sources.includes(requested.from)) {
    return { fromYear: requested.from, toYear };
  }
  const before = sources.filter((year) => toYear === null || year < toYear);
  return { fromYear: latestOf(before) ?? latestOf(sources), toYear };
}
