import { Download, Plus } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const summaryHeaderDashboardPage = {
  container: cn("flex flex-wrap items-center gap-3.5"),
  text: cn("flex min-w-0 flex-1 flex-col gap-1"),
  title: cn("font-display text-[34px] leading-tight font-semibold tracking-tight"),
  subtitle: cn("text-[14.5px] text-[var(--tinta-suave)]"),
};

interface SummaryHeaderProps {
  greeting: string;
  firstName: string;
  dateLabel: string;
  churchName: string;
}

export function SummaryHeader({ greeting, firstName, dateLabel, churchName }: SummaryHeaderProps) {
  return (
    <header className={summaryHeaderDashboardPage.container}>
      <div className={summaryHeaderDashboardPage.text}>
        <h2 className={summaryHeaderDashboardPage.title}>
          {greeting}, {firstName}.
        </h2>
        <p className={summaryHeaderDashboardPage.subtitle}>
          Así está la tesorería de Iglesia {churchName} este {dateLabel}.
        </p>
      </div>
      <BoardButton href={getChurchRoutePath("reports")}>
        <Download aria-hidden="true" className="size-[17px]" />
        Exportar
      </BoardButton>
      <BoardButton href={getChurchRoutePath("movements")} variant="primary">
        <Plus aria-hidden="true" className="size-[17px]" />
        Nuevo movimiento
      </BoardButton>
    </header>
  );
}
