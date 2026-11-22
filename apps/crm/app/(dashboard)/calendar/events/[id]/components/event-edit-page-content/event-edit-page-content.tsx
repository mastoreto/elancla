import type { EditorialStatusDto } from "@ancla/contracts";
import { cn } from "@/lib/utils";
import type { EventEditorData, SiteLocales } from "../../types";
import { limitActionsToDraft } from "../../utils/limitActionsToDraft";
import { EventDeleteButton } from "../event-delete-button";
import { EventForm } from "../event-form";
import { EventNotices } from "../event-notices";
import { EventVisibilityCard } from "../event-visibility-card";

const eventEditPageContentCalendarPage = {
  container: cn("flex flex-col gap-[18px]"),
};

interface EventEditPageContentProps extends EventEditorData {
  status: EditorialStatusDto;
  site: SiteLocales;
  canEditSettings: boolean;
  canDelete: boolean;
}

/** The notices, the content form, the visibility card and (with permission) the delete button. */
export function EventEditPageContent({
  event,
  calendarYear,
  status,
  site,
  ministries,
  places,
  roles,
  canEditSettings,
  canDelete,
}: EventEditPageContentProps) {
  const yearIsDraft = calendarYear.status === "draft";
  return (
    <div className={eventEditPageContentCalendarPage.container}>
      <EventNotices needsReview={event.needsReview} year={event.year} yearIsDraft={yearIsDraft} />
      <EventForm
        eventId={event.id}
        ministries={ministries}
        places={places}
        site={site}
        status={limitActionsToDraft(status, yearIsDraft)}
        year={event.year}
      />
      <EventVisibilityCard
        canEdit={canEditSettings}
        // A saved version remounts the card so its fields start from what the server holds.
        key={`visibility-${event.version}`}
        event={event}
        roles={roles}
      />
      {canDelete ? <EventDeleteButton eventId={event.id} /> : null}
    </div>
  );
}
