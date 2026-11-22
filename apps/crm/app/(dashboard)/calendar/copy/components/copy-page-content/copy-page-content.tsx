"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardFormFooter, BoardSwitchRow } from "@/components/dashboard/board/board-form";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { CopyFilters as CopyFiltersValue, CopyPageData } from "../../types";
import {
  areAllSelected,
  buildCopyBody,
  countSelected,
  describeCopyOutcome,
  filterCopyItems,
  toggleAllFiltered,
  toggleSelected,
} from "../../utils/copySelection";
import { CopyFilters } from "../copy-filters";
import { CopyItemRow } from "../copy-item-row";
import { CopyYearPicker } from "../copy-year-picker";

const copyPageContentCopyPage = {
  container: cn("flex flex-col gap-4"),
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  done: cn(
    "flex flex-wrap items-center gap-3 rounded-[20px] bg-[var(--vida-50)] px-4 py-3 text-sm",
  ),
  counter: cn("mr-auto self-center text-[13px] text-[var(--tinta-suave)]"),
};

const NO_FILTERS: CopyFiltersValue = { kind: "all", ministryId: "" };
const NOTHING_SELECTED = "Elige al menos una actividad o un evento.";

/** The "copy from the previous year" wizard: years, filters, one checkbox per item and the copy. */
export function CopyPageContent({ years, fromYear, toYear, items, ministries }: CopyPageData) {
  const [filters, setFilters] = useState(NO_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [keepExactDates, setKeepExactDates] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { busy, run } = useCalendarRequest();
  const filtered = filterCopyItems(items, filters);
  const selectedCount = countSelected(items, selectedIds);

  async function copy(): Promise<void> {
    if (fromYear === null || toYear === null) return;
    if (selectedCount === 0) {
      toast.error(NOTHING_SELECTED);
      return;
    }
    const body = buildCopyBody({ items, selectedIds, fromYear, keepExactDates });
    const response = await run(
      () =>
        calendarApiClient.content.calendar.years[":year"].copy.$post({
          param: { year: String(toYear) },
          json: body,
        }),
      null,
    );
    if (!response) return;
    const message = describeCopyOutcome(await response.json());
    toast.success(message);
    setDone(message);
    setSelectedIds([]);
  }

  return (
    <BoardCard data-testid="calendar-copy-card">
      <BoardCardHeader
        action={
          <BoardButton href={getChurchRoutePath("calendar")} variant="ghost">
            Volver
          </BoardButton>
        }
        subtitle="Elige qué pasa al año nuevo. Lo copiado queda marcado «a revisar» hasta que alguien lo confirme."
        title="Copiar del año anterior"
      />
      <div className={copyPageContentCopyPage.container}>
        <CopyYearPicker fromYear={fromYear} toYear={toYear} years={years} />
        {toYear === null ? (
          <p className={copyPageContentCopyPage.empty}>
            No hay ningún año en borrador. Crea primero el año nuevo en el calendario.
          </p>
        ) : null}
        {fromYear !== null && toYear !== null ? (
          <>
            <CopyFilters
              allSelected={areAllSelected(selectedIds, filtered)}
              disabled={busy}
              filteredCount={filtered.length}
              filters={filters}
              ministries={ministries}
              onChange={setFilters}
              onToggleAll={() => setSelectedIds(toggleAllFiltered(selectedIds, filtered))}
            />
            {filtered.length === 0 ? (
              <p className={copyPageContentCopyPage.empty}>
                No hay nada que copiar con estos filtros en {fromYear}.
              </p>
            ) : (
              <div className={copyPageContentCopyPage.list}>
                {filtered.map((item) => (
                  <CopyItemRow
                    checked={selectedIds.includes(item.id)}
                    detail={item.detail}
                    key={item.id}
                    kind={item.kind}
                    onCheckedChange={() => setSelectedIds(toggleSelected(selectedIds, item.id))}
                    testId={`copy-item-${item.id}`}
                    title={item.title}
                  />
                ))}
              </div>
            )}
            <BoardSwitchRow
              checked={keepExactDates}
              hint="Apagado, las fechas pasan al mismo día de la semana del año nuevo."
              onCheckedChange={setKeepExactDates}
              title="Mantener la fecha exacta"
            />
            {done ? (
              <div className={copyPageContentCopyPage.done} data-testid="copy-done">
                {done}
                <BoardButton href={`${getChurchRoutePath("calendar")}?year=${toYear}`} size="sm">
                  Ver el {toYear}
                </BoardButton>
              </div>
            ) : null}
            <BoardFormFooter>
              <span className={copyPageContentCopyPage.counter}>
                {selectedCount} seleccionados de {items.length}
              </span>
              <BoardButton
                data-testid="copy-submit"
                disabled={busy || selectedCount === 0}
                onClick={() => void copy()}
                variant="primary"
              >
                {busy ? "Copiando…" : `Copiar al ${toYear}`}
              </BoardButton>
            </BoardFormFooter>
          </>
        ) : null}
      </div>
    </BoardCard>
  );
}
