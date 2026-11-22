import { cn } from "@/lib/utils";

const eventNoticesCalendarPage = {
  container: cn("mx-auto flex w-full max-w-[900px] flex-col gap-2.5"),
  notice: cn("rounded-[18px] bg-[var(--oro-50)] px-4 py-3"),
  text: cn("text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
};

interface EventNoticesProps {
  year: number;
  /** The year is still a draft: its events go live together with it. */
  yearIsDraft: boolean;
  /** Copied from the previous year and not looked at again yet. */
  needsReview: boolean;
}

/** What the editor should know before touching the event: the draft year and the pending review. */
export function EventNotices({ year, yearIsDraft, needsReview }: EventNoticesProps) {
  if (!yearIsDraft && !needsReview) return null;
  return (
    <div className={eventNoticesCalendarPage.container}>
      {yearIsDraft ? (
        <div className={eventNoticesCalendarPage.notice} data-testid="event-year-draft-notice">
          <p className={eventNoticesCalendarPage.text}>
            {`El año ${year} es un borrador: el evento se publica junto con el año completo. Por ahora solo puedes guardar el borrador.`}
          </p>
        </div>
      ) : null}
      {needsReview ? (
        <div className={eventNoticesCalendarPage.notice} data-testid="event-needs-review-notice">
          <p className={eventNoticesCalendarPage.text}>
            A revisar: este evento se copió del año anterior. Revisa las fechas y el resto de los
            datos; la marca se quita al publicarlo.
          </p>
        </div>
      ) : null}
    </div>
  );
}
