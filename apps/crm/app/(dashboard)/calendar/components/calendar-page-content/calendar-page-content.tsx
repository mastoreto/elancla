import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { CalendarOverview } from "../../lib/loadCalendarOverview";
import { resolveEventMinistries } from "../../utils/resolveEventMinistries";
import { suggestNewYear } from "../../utils/suggestNewYear";
import { CreateYearButton } from "../create-year-button";
import { EventRow } from "../event-row";
import { NewEventButton } from "../new-event-button";
import { PendingYearCard } from "../pending-year-card";
import { YearBar } from "../year-bar";

const calendarPageContentCalendarPage = {
  container: cn("flex flex-col gap-[18px]"),
  links: cn("flex flex-wrap items-center gap-2.5"),
  spacer: cn("flex-1"),
  list: cn("flex flex-col gap-1"),
  empty: cn(
    "flex flex-col items-center gap-3 py-6 text-center text-sm text-[var(--tinta-apagada)]",
  ),
};

export interface CalendarPermissions {
  /** `events.edit`: create years, confirm reviews, copy and reminders. */
  canEdit: boolean;
  /** `events.create`. */
  canCreate: boolean;
  /** `calendar.year:publish`. */
  canPublish: boolean;
  /** `calendar.internal:view`: may offer and see internal events. */
  canUseInternal: boolean;
}

interface CalendarPageContentProps {
  overview: CalendarOverview;
  permissions: CalendarPermissions;
}

/** The calendar home: pending work of the next year, the year bar, the sub-pages and the events. */
export function CalendarPageContent({ overview, permissions }: CalendarPageContentProps) {
  const { years, selectedYear, events, pending, ministries, roles, defaultLocale } = overview;
  const { canEdit, canCreate, canPublish, canUseInternal } = permissions;
  const yearNumbers = years.map(({ year }) => year);

  return (
    <div className={calendarPageContentCalendarPage.container}>
      {pending?.hasPending ? (
        <PendingYearCard canEdit={canEdit} defaultLocale={defaultLocale} pending={pending} />
      ) : null}
      <div className={calendarPageContentCalendarPage.links}>
        <BoardButton href={getChurchRoutePath("calendar", "schedule")} size="sm" variant="outline">
          Horarios
        </BoardButton>
        <BoardButton href={getChurchRoutePath("calendar", "places")} size="sm" variant="outline">
          Lugares
        </BoardButton>
        {canEdit ? (
          <>
            <BoardButton href={getChurchRoutePath("calendar", "copy")} size="sm" variant="outline">
              Copiar año
            </BoardButton>
            <BoardButton
              href={getChurchRoutePath("calendar", "reminders")}
              size="sm"
              variant="outline"
            >
              Recordatorios
            </BoardButton>
          </>
        ) : null}
        <span className={calendarPageContentCalendarPage.spacer} />
        {canCreate && selectedYear !== null ? (
          <NewEventButton roles={canUseInternal ? roles : null} year={selectedYear} />
        ) : null}
      </div>
      {selectedYear === null ? (
        <BoardCard>
          <div className={calendarPageContentCalendarPage.empty}>
            <p>Todavía no hay ningún año en el calendario.</p>
            {canEdit ? (
              <CreateYearButton
                suggestedYear={suggestNewYear(yearNumbers, new Date().getFullYear())}
                variant="primary"
              />
            ) : null}
          </div>
        </BoardCard>
      ) : (
        <>
          <YearBar
            canEdit={canEdit}
            canPublish={canPublish}
            selectedYear={selectedYear}
            suggestedYear={suggestNewYear(yearNumbers, new Date().getFullYear())}
            years={years}
          />
          <BoardCard>
            {events.length === 0 ? (
              <p className={calendarPageContentCalendarPage.empty}>
                Este año todavía no tiene eventos.
              </p>
            ) : (
              <div className={calendarPageContentCalendarPage.list}>
                {events.map((event) => (
                  <EventRow
                    defaultLocale={defaultLocale}
                    event={event}
                    key={event.id}
                    ministries={resolveEventMinistries(event.ministryIds, ministries)}
                  />
                ))}
              </div>
            )}
          </BoardCard>
        </>
      )}
    </div>
  );
}
