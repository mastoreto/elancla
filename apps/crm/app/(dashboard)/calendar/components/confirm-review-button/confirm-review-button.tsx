"use client";

import { Check } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import { useCalendarRequest } from "../../hooks/useCalendarRequest";

const confirmReviewButtonCalendarPage = {
  icon: cn("size-4"),
};

interface ConfirmReviewButtonProps {
  year: number;
  activityId: string;
}

/** Confirms that a fixed activity with annual review is still right for the year. */
export function ConfirmReviewButton({ year, activityId }: ConfirmReviewButtonProps) {
  const { busy, run } = useCalendarRequest();

  function confirm(): void {
    void run(
      () =>
        calendarApiClient.content.calendar.years[":year"].reviews.$post({
          param: { year: String(year) },
          json: { activityId },
        }),
      "Revisión confirmada.",
    );
  }

  return (
    <BoardButton
      data-testid="confirm-review-button"
      disabled={busy}
      onClick={confirm}
      size="sm"
      variant="outline"
    >
      <Check aria-hidden="true" className={confirmReviewButtonCalendarPage.icon} />
      {busy ? "Confirmando…" : "Confirmar"}
    </BoardButton>
  );
}
