"use client";

import { useRouter } from "next/navigation";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useEventRequest } from "../../hooks/useEventRequest";

const LIVE_EVENT_MESSAGE = "Este evento ya está en el sitio: cancélalo en lugar de eliminarlo.";

const eventDeleteButtonCalendarPage = {
  container: cn("mx-auto flex w-full max-w-[900px] justify-end"),
};

interface EventDeleteButtonProps {
  eventId: string;
}

/** Deletes an event that was never published; a live one answers 409 and must be cancelled. */
export function EventDeleteButton({ eventId }: EventDeleteButtonProps) {
  const router = useRouter();
  const { busy, run } = useEventRequest();

  async function remove(): Promise<void> {
    const deleted = await run(
      () => calendarApiClient.content.calendar.events[":id"].$delete({ param: { id: eventId } }),
      { success: "Evento eliminado", conflict: LIVE_EVENT_MESSAGE },
    );
    if (deleted) router.push(getChurchRoutePath("calendar"));
  }

  return (
    <div className={eventDeleteButtonCalendarPage.container}>
      <BoardConfirmDialog
        confirmLabel="Eliminar evento"
        description="El evento y su borrador se borran para siempre. Si ya se publicó, no se puede eliminar: cámbialo a cancelado."
        onConfirm={() => void remove()}
        title="Eliminar evento"
        trigger={
          <BoardButton data-testid="event-delete" disabled={busy} variant="outline">
            Eliminar evento
          </BoardButton>
        }
      />
    </div>
  );
}
