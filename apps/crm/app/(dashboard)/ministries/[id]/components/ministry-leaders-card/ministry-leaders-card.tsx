"use client";

import {
  MINISTRY_LEADERS_MAX_COUNT,
  PERSON_TITLE_MAX_LENGTH,
  type PersonProfileDto,
} from "@ancla/contracts";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { useMinistryRequest } from "../../../hooks/useMinistryRequest";
import type { MinistryLeaderValues, SiteLocales } from "../../types";
import {
  blankLeaderRow,
  hasLeaderErrors,
  nextLeaderOrder,
  toMinistryLeaderRows,
  toMinistryLeadersBody,
  validateMinistryLeaders,
} from "../../utils/ministryLeadersValues";

const ministryLeadersCardMinistriesPage = {
  list: cn("flex flex-col gap-3"),
  item: cn("flex items-start gap-3 rounded-[20px] bg-[var(--oro-50)] p-3.5"),
  fields: cn("flex min-w-0 flex-1 flex-col gap-3"),
  empty: cn("text-sm text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
  icon: cn("size-4"),
};

interface MinistryLeadersCardProps {
  ministryId: string;
  /** Every person of the organization: the candidates, and where the current leaders are read from. */
  people: readonly PersonProfileDto[];
  site: SiteLocales;
}

/** The leaders of one ministry; saving replaces the whole list. */
export function MinistryLeadersCard({ ministryId, people, site }: MinistryLeadersCardProps) {
  const { locales, defaultLocale } = site;
  const [rows, setRows] = useState<MinistryLeaderValues[]>(() =>
    toMinistryLeaderRows(people, ministryId, locales),
  );
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useMinistryRequest();
  const errors = validateMinistryLeaders(rows, defaultLocale);
  const personOptions = people.map((person) => ({ value: person.id, label: person.name }));
  const incompleteLocales = locales.filter((locale) =>
    rows.some((row) => (row.titles[locale] ?? "").trim() === ""),
  );

  const patchRow = (index: number, patch: Partial<MinistryLeaderValues>) =>
    setRows((previous) => previous.map((row, at) => (at === index ? { ...row, ...patch } : row)));
  const patchTitle = (index: number, title: string) =>
    setRows((previous) =>
      previous.map((row, at) =>
        at === index ? { ...row, titles: { ...row.titles, [activeLocale]: title } } : row,
      ),
    );
  const removeRow = (index: number) =>
    setRows((previous) => previous.filter((_, at) => at !== index));

  async function submit(): Promise<void> {
    if (hasLeaderErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      return;
    }
    await run(
      () =>
        apiClient.content.ministries[":id"].leaders.$put({
          param: { id: ministryId },
          json: toMinistryLeadersBody(rows),
        }),
      "Responsables guardados",
    );
  }

  return (
    <BoardFormCard
      subtitle="Quiénes lideran el ministerio. Solo aparecen en el sitio los que marques como visibles."
      title="Responsables"
    >
      <BoardFormSections>
        <BoardFormSection>
          <LocaleTabs
            defaultLocale={defaultLocale}
            incompleteLocales={incompleteLocales}
            label="Idioma del cargo"
            locales={locales}
            onChange={setActiveLocale}
            value={activeLocale}
          />
          {rows.length === 0 ? (
            <p className={ministryLeadersCardMinistriesPage.empty}>Todavía no hay responsables.</p>
          ) : null}
          <div className={ministryLeadersCardMinistriesPage.list} data-testid="ministry-leaders">
            {rows.map((row, index) => {
              const rowErrors = showErrors ? (errors.rows[index] ?? {}) : {};
              return (
                // Rows are edited in place and have no id until saved, so the position is theirs.
                // biome-ignore lint/suspicious/noArrayIndexKey: see above.
                <div className={ministryLeadersCardMinistriesPage.item} key={index}>
                  <div className={ministryLeadersCardMinistriesPage.fields}>
                    <BoardSelect
                      error={rowErrors.personProfileId}
                      id={`ministry-leader-person-${index}`}
                      label="Persona"
                      onValueChange={(personProfileId) => patchRow(index, { personProfileId })}
                      options={personOptions}
                      placeholder="Elige una persona"
                      value={row.personProfileId}
                    />
                    <BoardFormRow>
                      <BoardInput
                        error={rowErrors.title}
                        id={`ministry-leader-title-${index}`}
                        label={`Cargo (${activeLocale})`}
                        maxLength={PERSON_TITLE_MAX_LENGTH}
                        onChange={(event) => patchTitle(index, event.target.value)}
                        value={row.titles[activeLocale] ?? ""}
                      />
                      <BoardInput
                        error={rowErrors.order}
                        id={`ministry-leader-order-${index}`}
                        inputMode="numeric"
                        label="Orden"
                        onChange={(event) => patchRow(index, { order: event.target.value })}
                        value={row.order}
                      />
                    </BoardFormRow>
                    <BoardSwitchRow
                      checked={row.visible}
                      hint="Si no, solo lo ve el equipo en el CRM."
                      onCheckedChange={(visible) => patchRow(index, { visible })}
                      title="Visible en el sitio"
                    />
                  </div>
                  <RowIconButton
                    label={`Quitar al responsable ${index + 1}`}
                    onClick={() => removeRow(index)}
                  >
                    <Trash2 aria-hidden="true" className={ministryLeadersCardMinistriesPage.icon} />
                  </RowIconButton>
                </div>
              );
            })}
          </div>
          {showErrors && errors.list ? (
            <span className={ministryLeadersCardMinistriesPage.error}>{errors.list}</span>
          ) : null}
          {rows.length >= MINISTRY_LEADERS_MAX_COUNT ? null : (
            <div>
              <BoardButton
                data-testid="ministry-leader-add"
                onClick={() =>
                  setRows((previous) => [
                    ...previous,
                    blankLeaderRow(locales, nextLeaderOrder(previous)),
                  ])
                }
                variant="outline"
              >
                <Plus aria-hidden="true" className={ministryLeadersCardMinistriesPage.icon} />
                Agregar responsable
              </BoardButton>
            </div>
          )}
        </BoardFormSection>
      </BoardFormSections>
      <BoardFormFooter>
        <BoardButton
          data-testid="ministry-leaders-save"
          disabled={busy}
          onClick={() => void submit()}
          variant="primary"
        >
          {busy ? "Guardando…" : "Guardar responsables"}
        </BoardButton>
      </BoardFormFooter>
    </BoardFormCard>
  );
}
