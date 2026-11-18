import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { ReportTemplateItem } from "../types";
import { REPORT_KIND_TONE, ReportKindIcon } from "./report-kind-icon";

const reportCatalogReportsPage = {
  card: cn("p-6"),
  grid: cn("grid grid-cols-1 gap-3.5 md:grid-cols-3"),
  item: cn("flex flex-col gap-2.5 rounded-3xl bg-secondary p-[18px]"),
  bubble: cn("size-10"),
  icon: cn("size-5"),
  name: cn("font-display text-[19px] font-medium"),
  description: cn("text-[13px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("self-start"),
};

export function ReportCatalog({ templates }: { templates: ReportTemplateItem[] }) {
  return (
    <BoardCard className={reportCatalogReportsPage.card}>
      <BoardCardHeader
        subtitle="Plantillas listas para configurar"
        title="Reportes disponibles en el catálogo"
      />
      <div className={reportCatalogReportsPage.grid}>
        {templates.map((template) => (
          <div className={reportCatalogReportsPage.item} key={template.kind}>
            <IconBubble
              className={reportCatalogReportsPage.bubble}
              tone={REPORT_KIND_TONE[template.kind]}
            >
              <ReportKindIcon className={reportCatalogReportsPage.icon} kind={template.kind} />
            </IconBubble>
            <b className={reportCatalogReportsPage.name}>{template.name}</b>
            <span className={reportCatalogReportsPage.description}>{template.description}</span>
            <BoardButton
              className={reportCatalogReportsPage.action}
              href={`${getChurchRoutePath("reports", "new")}?template=${template.kind}`}
              size="sm"
              variant="outline"
            >
              Usar plantilla
            </BoardButton>
          </div>
        ))}
      </div>
    </BoardCard>
  );
}
