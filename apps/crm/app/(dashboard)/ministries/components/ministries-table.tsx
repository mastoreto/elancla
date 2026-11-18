import { Eye, PencilLine } from "lucide-react";
import Link from "next/link";
import { BoardCard } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
  boardTableRaisedClass,
  boardTableRowLinkClass,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { MinistrySummary } from "../types";
import {
  formatMoney,
  getExecutionPercent,
  getExecutionTone,
  getMinistryAppearance,
} from "../utils";

interface MinistriesTableProps {
  ministries: readonly MinistrySummary[];
}

const COLUMNS = "1.6fr 1.2fr 100px 1.2fr 100px";
const HEADERS = ["Ministerio", "Líder", "Voluntarios", "Presupuesto", ""];

const ministriesTableMinistriesPage = {
  card: cn("flex flex-col gap-1 p-5"),
  name: cn("flex min-w-0 items-center gap-3"),
  bubble: cn("size-[38px]"),
  nameText: cn("flex min-w-0 flex-col gap-0.5"),
  link: cn("font-bold", boardTableRowLinkClass),
  category: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  muted: cn("text-[var(--tinta-suave)]"),
  number: cn("font-bold tabular-nums"),
  budget: cn("flex w-full flex-col gap-2"),
  budgetLabel: cn("text-xs text-[var(--tinta-apagada)] tabular-nums"),
  actions: cn("flex justify-end gap-1.5", boardTableRaisedClass),
  icon: cn("size-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function MinistriesTable({ ministries }: MinistriesTableProps) {
  return (
    <BoardCard className={ministriesTableMinistriesPage.card}>
      <BoardTableHead columns={COLUMNS} labels={HEADERS} />
      {ministries.length === 0 ? (
        <p className={ministriesTableMinistriesPage.empty}>No hay ministerios encontrados.</p>
      ) : (
        <BoardTableList>
          {ministries.map((ministry) => {
            const percent = getExecutionPercent(ministry);
            const { icon: Icon, tone } = getMinistryAppearance(ministry.id);
            const detailHref = getChurchRoutePath("ministries", ministry.id);
            return (
              <BoardTableRow columns={COLUMNS} key={ministry.id}>
                <div className={ministriesTableMinistriesPage.name}>
                  <IconBubble className={ministriesTableMinistriesPage.bubble} tone={tone}>
                    <Icon aria-hidden="true" className={ministriesTableMinistriesPage.icon} />
                  </IconBubble>
                  <div className={ministriesTableMinistriesPage.nameText}>
                    <Link className={ministriesTableMinistriesPage.link} href={detailHref}>
                      {ministry.name}
                    </Link>
                    <span className={ministriesTableMinistriesPage.category}>
                      {ministry.category}
                    </span>
                  </div>
                </div>
                <span className={ministriesTableMinistriesPage.muted}>{ministry.leaderName}</span>
                <b className={ministriesTableMinistriesPage.number}>{ministry.volunteers}</b>
                <div className={ministriesTableMinistriesPage.budget}>
                  <ProgressBar
                    label={`${ministry.name}: ${percent} % ejecutado`}
                    tone={getExecutionTone(percent)}
                    value={percent}
                  />
                  <span className={ministriesTableMinistriesPage.budgetLabel}>
                    {formatMoney(ministry.currency, ministry.executed)} de{" "}
                    {formatMoney(ministry.currency, ministry.budget)} · {percent} %
                  </span>
                </div>
                <div className={ministriesTableMinistriesPage.actions}>
                  <RowIconButton href={detailHref} label={`Ver ${ministry.name}`}>
                    <Eye aria-hidden="true" className={ministriesTableMinistriesPage.icon} />
                  </RowIconButton>
                  <RowIconButton href={`${detailHref}/edit`} label={`Editar ${ministry.name}`}>
                    <PencilLine aria-hidden="true" className={ministriesTableMinistriesPage.icon} />
                  </RowIconButton>
                </div>
              </BoardTableRow>
            );
          })}
        </BoardTableList>
      )}
    </BoardCard>
  );
}
