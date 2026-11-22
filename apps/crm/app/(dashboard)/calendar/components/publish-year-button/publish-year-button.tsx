"use client";

import { Rocket } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardConfirmDialog } from "@/components/dashboard/board/board-confirm-dialog";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import { useCalendarRequest } from "../../hooks/useCalendarRequest";

const publishYearButtonCalendarPage = {
  bubbleIcon: cn("size-6"),
  icon: cn("size-4"),
};

interface PublishYearButtonProps {
  year: number;
}

/** Publishes the draft year: every event draft of it goes live in one step, after a confirmation. */
export function PublishYearButton({ year }: PublishYearButtonProps) {
  const { busy, run } = useCalendarRequest();

  function publish(): void {
    void run(
      () =>
        calendarApiClient.content.calendar.years[":year"].publish.$post({
          param: { year: String(year) },
        }),
      `El año ${year} ya está publicado.`,
    );
  }

  return (
    <BoardConfirmDialog
      confirmLabel="Publicar año"
      description={`Esto pone en vivo, en el sitio público, todos los borradores del año ${year}: actividades y eventos a la vez.`}
      icon={<Rocket aria-hidden="true" className={publishYearButtonCalendarPage.bubbleIcon} />}
      notice="Revisa los eventos y las actividades del año antes de continuar."
      onConfirm={publish}
      title={`Publicar el año ${year}`}
      trigger={
        <BoardButton data-testid="publish-year-button" disabled={busy} variant="primary">
          <Rocket aria-hidden="true" className={publishYearButtonCalendarPage.icon} />
          Publicar año
        </BoardButton>
      }
    />
  );
}
