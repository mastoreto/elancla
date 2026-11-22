"use client";

import { CALENDAR_YEAR_MAX, CALENDAR_YEAR_MIN } from "@ancla/contracts";
import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardDialogContent } from "@/components/dashboard/board/board-dialog";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { Dialog } from "@/components/ui/dialog";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useCalendarRequest } from "../../hooks/useCalendarRequest";

const createYearButtonCalendarPage = {
  form: cn("flex flex-col gap-4"),
  footer: cn("flex flex-wrap justify-end gap-2.5 pt-1"),
  icon: cn("size-4"),
};

interface CreateYearButtonProps {
  /** The year the field starts with: the first one that does not exist yet. */
  suggestedYear: number;
  variant?: "primary" | "outline";
}

function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= CALENDAR_YEAR_MIN && year <= CALENDAR_YEAR_MAX;
}

/** Asks for the year number and creates it as a draft, then opens it. */
export function CreateYearButton({ suggestedYear, variant = "outline" }: CreateYearButtonProps) {
  const router = useRouter();
  const { busy, run } = useCalendarRequest();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(suggestedYear));
  const year = Number(value);
  const error = isValidYear(year)
    ? undefined
    : `Escribe un año entre ${CALENDAR_YEAR_MIN} y ${CALENDAR_YEAR_MAX}.`;

  async function create(): Promise<void> {
    if (error) return;
    const response = await run(
      () => calendarApiClient.content.calendar.years.$post({ json: { year } }),
      `Año ${year} creado como borrador.`,
    );
    if (!response) return;
    setOpen(false);
    router.push(`${getChurchRoutePath("calendar")}?year=${year}`);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <BoardButton data-testid="create-year-button" onClick={() => setOpen(true)} variant={variant}>
        <CalendarPlus aria-hidden="true" className={createYearButtonCalendarPage.icon} />
        Crear año
      </BoardButton>
      <BoardDialogContent
        description="El año nuevo empieza como borrador: no se ve en el sitio hasta que lo publiques."
        title="Crear un año"
      >
        <form
          className={createYearButtonCalendarPage.form}
          noValidate={true}
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <BoardInput
            error={error}
            id="create-year-number"
            inputMode="numeric"
            label="Año"
            onChange={(event) => setValue(event.target.value)}
            value={value}
          />
          <div className={createYearButtonCalendarPage.footer}>
            <BoardButton disabled={busy} onClick={() => setOpen(false)} variant="ghost">
              Cancelar
            </BoardButton>
            <BoardButton
              data-testid="create-year-submit"
              disabled={busy || error !== undefined}
              onClick={() => void create()}
              variant="primary"
            >
              {busy ? "Creando…" : "Crear año"}
            </BoardButton>
          </div>
        </form>
      </BoardDialogContent>
    </Dialog>
  );
}
