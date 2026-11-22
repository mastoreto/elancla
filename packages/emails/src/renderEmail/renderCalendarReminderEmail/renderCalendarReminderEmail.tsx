import { NoticeEmail } from "../../templates/notice-email";
import type { RenderedEmail } from "../renderBoth";
import { renderBoth } from "../renderBoth";

export interface CalendarReminderInput {
  churchName: string;
  recipientEmail: string;
  /** The year that has to be ready. */
  year: number;
  /** The year is already published (only reviews are left). */
  yearPublished: boolean;
  /** Fixed activities with annual review that nobody confirmed yet. */
  pendingReviews: number;
  /** Where the button leads: the calendar in the CRM. */
  actionUrl: string;
}

function pendingLines({
  year,
  yearPublished,
  pendingReviews,
}: CalendarReminderInput): string[] {
  const lines: string[] = [];
  if (!yearPublished) lines.push(`Publicar el calendario ${year}`);
  if (pendingReviews > 0) {
    lines.push(`Confirmar ${pendingReviews} horario(s) fijo(s) para ${year}`);
  }
  return lines;
}

export function renderCalendarReminderEmail(
  input: CalendarReminderInput,
): Promise<RenderedEmail> {
  const lines = pendingLines(input);
  return renderBoth(
    `Falta preparar el calendario ${input.year}`,
    <NoticeEmail
      actionLabel="Abrir el calendario"
      actionUrl={input.actionUrl}
      churchName={input.churchName}
      details={lines.map((value, index) => ({
        label: `Pendiente ${index + 1}`,
        value,
      }))}
      glyph="!"
      message={`Todavía queda trabajo para que el calendario ${input.year} esté listo en el sitio.`}
      recipientEmail={input.recipientEmail}
      title={`Prepara el calendario ${input.year}`}
      tone="gold"
    />,
  );
}
