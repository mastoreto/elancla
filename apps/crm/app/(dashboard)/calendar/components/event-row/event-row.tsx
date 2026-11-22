import type { EventListItemDto } from "@ancla/contracts";
import Link from "next/link";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { stateLabel, stateTone } from "@/components/editorial/editorial-status-bar/utils";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { CalendarMinistry } from "../../types";
import { formatEventWhen } from "../../utils/formatEventWhen";
import { ministryColorValue } from "../../utils/ministryColorValue";
import { pickTitle } from "../../utils/pickTitle";

const eventRowCalendarPage = {
  container: cn(
    "flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)] focus-visible:bg-[var(--oro-50)]",
  ),
  swatch: cn("size-3 shrink-0 rounded-full"),
  main: cn("flex min-w-0 flex-1 basis-60 flex-col gap-0.5"),
  title: cn("truncate text-[15px] font-bold"),
  cancelled: cn("text-[var(--tinta-apagada)] line-through"),
  meta: cn("truncate text-[12.5px] text-[var(--tinta-apagada)]"),
  ministries: cn("flex w-44 flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]"),
  ministry: cn("inline-flex items-center gap-1.5 text-[var(--tinta-suave)]"),
  dot: cn("size-2 rounded-full"),
  visibility: cn("w-20 text-[13px] text-[var(--tinta-suave)]"),
  states: cn("flex flex-wrap items-center gap-1.5"),
};

const VISIBILITY_LABELS = { public: "Pública", internal: "Interna" } satisfies Record<
  EventListItemDto["visibility"],
  string
>;

interface EventRowProps {
  event: EventListItemDto;
  /** The ministries of the event, already resolved (see `resolveEventMinistries`). */
  ministries: readonly CalendarMinistry[];
  defaultLocale: string;
}

/** One event of the year: when, title, ministries, visibility and its editorial and site state. */
export function EventRow({ event, ministries, defaultLocale }: EventRowProps) {
  const cancelled = event.status === "cancelled";
  return (
    <Link
      className={eventRowCalendarPage.container}
      data-testid="event-row"
      href={`${getChurchRoutePath("calendar", "events", event.id)}?year=${event.year}`}
    >
      <span
        aria-hidden="true"
        className={eventRowCalendarPage.swatch}
        style={{ backgroundColor: ministryColorValue(ministries[0]?.color) }}
      />
      <span className={eventRowCalendarPage.main}>
        <span
          className={cn(eventRowCalendarPage.title, cancelled && eventRowCalendarPage.cancelled)}
        >
          {pickTitle(event.titles, defaultLocale)}
        </span>
        <span className={eventRowCalendarPage.meta}>{formatEventWhen(event)}</span>
      </span>
      <span className={eventRowCalendarPage.ministries}>
        {ministries.length === 0 ? (
          <span className={eventRowCalendarPage.ministry}>Toda la iglesia</span>
        ) : (
          ministries.map((ministry) => (
            <span className={eventRowCalendarPage.ministry} key={ministry.id}>
              <span
                aria-hidden="true"
                className={eventRowCalendarPage.dot}
                style={{ backgroundColor: ministryColorValue(ministry.color) }}
              />
              {ministry.name}
            </span>
          ))
        )}
      </span>
      <span className={eventRowCalendarPage.visibility}>{VISIBILITY_LABELS[event.visibility]}</span>
      <span className={eventRowCalendarPage.states}>
        {event.editorialState ? (
          <StatusPill tone={stateTone(event.editorialState)}>
            {stateLabel(event.editorialState)}
          </StatusPill>
        ) : (
          <StatusPill tone="ink">Sin borrador</StatusPill>
        )}
        {cancelled ? <StatusPill tone="rose">Cancelado</StatusPill> : null}
        {event.needsReview ? <StatusPill tone="gold">A revisar</StatusPill> : null}
        {event.isLive ? <StatusPill tone="green">En el sitio</StatusPill> : null}
      </span>
    </Link>
  );
}
