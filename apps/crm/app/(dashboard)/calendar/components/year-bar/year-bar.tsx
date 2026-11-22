import type { CalendarYearDto } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { CreateYearButton } from "../create-year-button";
import { PublishYearButton } from "../publish-year-button";

const yearBarCalendarPage = {
  container: cn("flex flex-wrap items-center gap-3"),
  years: cn("flex flex-wrap items-center gap-1.5"),
  spacer: cn("flex-1"),
};

interface YearBarProps {
  years: readonly CalendarYearDto[];
  selectedYear: number;
  /** The first year that does not exist yet, to start "Crear año" with. */
  suggestedYear: number;
  canPublish: boolean;
  canEdit: boolean;
}

/** Year switcher (links that change `?year=`), its draft/published state and the year actions. */
export function YearBar({ years, selectedYear, suggestedYear, canPublish, canEdit }: YearBarProps) {
  const selected = years.find(({ year }) => year === selectedYear);
  const isDraft = selected?.status === "draft";
  return (
    <div className={yearBarCalendarPage.container}>
      <nav aria-label="Año" className={yearBarCalendarPage.years}>
        {years.map(({ year }) => (
          <BoardButton
            aria-current={year === selectedYear ? "page" : undefined}
            href={`${getChurchRoutePath("calendar")}?year=${year}`}
            key={year}
            size="sm"
            variant={year === selectedYear ? "dark" : "outline"}
          >
            {year}
          </BoardButton>
        ))}
      </nav>
      {selected ? (
        <StatusPill data-testid="year-status" tone={isDraft ? "gold" : "green"}>
          {isDraft ? "Borrador" : "Publicado"}
        </StatusPill>
      ) : null}
      <span className={yearBarCalendarPage.spacer} />
      {isDraft && canPublish ? <PublishYearButton year={selectedYear} /> : null}
      {canEdit ? <CreateYearButton suggestedYear={suggestedYear} /> : null}
    </div>
  );
}
