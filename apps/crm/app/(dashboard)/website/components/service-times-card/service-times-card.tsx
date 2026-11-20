"use client";

import { MAX_SERVICE_TIMES, type SiteSettingsDto } from "@ancla/contracts";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";
import {
  findRowError,
  newRow,
  type ServiceTimeRow,
  toRows,
  toServiceTimes,
} from "../../utils/serviceTimeRows";
import { CardSaveFooter } from "../card-save-footer";

const serviceTimesCardWebsitePage = {
  notice: cn(
    "mb-3.5 rounded-2xl bg-[var(--oro-50)] px-4 py-2.5 text-[13px] text-[var(--tinta-suave)]",
  ),
  rows: cn("flex flex-col gap-3.5"),
  row: cn("grid items-end gap-3 md:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]"),
  rowError: cn("-mt-2 text-xs font-semibold text-primary"),
  icon: cn("size-4"),
  empty: cn("py-4 text-sm text-[var(--tinta-apagada)]"),
  add: cn("mt-3.5 flex items-center gap-3"),
  limit: cn("text-xs text-[var(--tinta-apagada)]"),
};

const KIND_OPTIONS = [
  { value: "worship", label: "Culto" },
  { value: "bibleSchool", label: "Escuela bíblica" },
] as const;

const WEEKDAY_OPTIONS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
] as const;

type ServiceTimesSettings = Pick<SiteSettingsDto, "serviceTimes" | "version">;

interface ServiceTimesCardProps {
  settings: ServiceTimesSettings;
}

function isServiceKind(value: string): value is ServiceTimeRow["kind"] {
  return KIND_OPTIONS.some((option) => option.value === value);
}

// ponytail: temporary bridge; phase 1.6 (calendar) replaces this card with worship-time activities.
export function ServiceTimesCard({ settings }: ServiceTimesCardProps) {
  const [rows, setRows] = useState<ServiceTimeRow[]>(() => toRows(settings.serviceTimes));
  const { canEdit, saving, save } = useSaveSiteSettings(settings.version);

  const update = (id: string, change: Partial<ServiceTimeRow>) =>
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, ...change } : row)));
  const remove = (id: string) => setRows((previous) => previous.filter((row) => row.id !== id));
  const hasErrors = rows.some((row) => findRowError(row) !== null);
  const isFull = rows.length >= MAX_SERVICE_TIMES;

  const submit = () => save({ serviceTimes: toServiceTimes(rows) }, "Horarios actualizados");

  return (
    <BoardCard>
      <BoardCardHeader
        subtitle="Cultos y escuela bíblica de cada semana"
        title="Horarios de reunión"
      />
      <p className={serviceTimesCardWebsitePage.notice}>Temporal hasta el calendario (1.6).</p>
      <div className={serviceTimesCardWebsitePage.rows}>
        {rows.length === 0 ? (
          <p className={serviceTimesCardWebsitePage.empty}>Todavía no hay horarios.</p>
        ) : null}
        {rows.map((row, index) => {
          const error = findRowError(row);
          return (
            <div key={row.id}>
              <div className={serviceTimesCardWebsitePage.row}>
                <BoardSelect
                  disabled={!canEdit}
                  id={`service-kind-${index}`}
                  label="Tipo"
                  onValueChange={(value) => isServiceKind(value) && update(row.id, { kind: value })}
                  options={KIND_OPTIONS}
                  value={row.kind}
                />
                <BoardSelect
                  disabled={!canEdit}
                  id={`service-weekday-${index}`}
                  label="Día"
                  onValueChange={(value) => update(row.id, { weekday: Number(value) })}
                  options={WEEKDAY_OPTIONS}
                  value={String(row.weekday)}
                />
                <BoardInput
                  disabled={!canEdit}
                  id={`service-start-${index}`}
                  label="Inicio"
                  onChange={(event) => update(row.id, { start: event.target.value })}
                  type="time"
                  value={row.start}
                />
                <BoardInput
                  disabled={!canEdit}
                  id={`service-end-${index}`}
                  label="Fin (opcional)"
                  onChange={(event) => update(row.id, { end: event.target.value })}
                  type="time"
                  value={row.end}
                />
                {canEdit ? (
                  <BoardButton
                    aria-label={`Quitar horario ${index + 1}`}
                    onClick={() => remove(row.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" className={serviceTimesCardWebsitePage.icon} />
                  </BoardButton>
                ) : null}
              </div>
              {error ? <p className={serviceTimesCardWebsitePage.rowError}>{error}</p> : null}
            </div>
          );
        })}
      </div>
      {canEdit ? (
        <div className={serviceTimesCardWebsitePage.add}>
          <BoardButton
            disabled={isFull}
            onClick={() => setRows((previous) => [...previous, newRow()])}
            size="sm"
          >
            <Plus aria-hidden="true" className={serviceTimesCardWebsitePage.icon} />
            Agregar horario
          </BoardButton>
          {isFull ? (
            <span className={serviceTimesCardWebsitePage.limit}>
              Máximo {MAX_SERVICE_TIMES} horarios.
            </span>
          ) : null}
        </div>
      ) : null}
      <CardSaveFooter
        canEdit={canEdit}
        disabled={hasErrors}
        onSave={() => void submit()}
        saving={saving}
      />
    </BoardCard>
  );
}
