import type { EventListItemDto } from "@ancla/contracts";
import { MONTH_SHORT_NAMES, WEEKDAY_SHORT_NAMES } from "../dateLabels";

type EventWhen = Pick<EventListItemDto, "startDate" | "startTime" | "endDate" | "allDay">;

const NO_DATE = "Sin fecha";
const ALL_DAY = "Todo el día";
const SEPARATOR = " · ";
const RANGE_ARROW = " → ";

/** "sáb 14 mar" from a wall-clock "YYYY-MM-DD"; no time zone is involved. */
function formatCalendarDay(date: string): string {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAY_SHORT_NAMES[weekday]} ${day} ${MONTH_SHORT_NAMES[month - 1]}`;
}

/** When an event happens, for the list: day or day range, then the hour or "Todo el día". */
export function formatEventWhen({ startDate, startTime, endDate, allDay }: EventWhen): string {
  if (startDate === null) return NO_DATE;
  const days =
    endDate !== null && endDate !== startDate
      ? `${formatCalendarDay(startDate)}${RANGE_ARROW}${formatCalendarDay(endDate)}`
      : formatCalendarDay(startDate);
  const time = allDay ? ALL_DAY : startTime;
  return time ? `${days}${SEPARATOR}${time}` : days;
}
