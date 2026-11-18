import {
  ArrowLeftRight,
  ArrowUpRight,
  CircleDollarSign,
  Heart,
  Mail,
  PencilLine,
  Trash2,
} from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { MinistryDetail } from "../types";
import {
  formatMoney,
  getExecutionPercent,
  getExecutionTone,
  getLeaderInitials,
  getMinistryAppearance,
} from "../utils";
import { MinistryDeleteDialog } from "./ministry-delete-dialog";

interface MinistryDetailContentProps {
  ministry: MinistryDetail;
}

const MOVEMENT_COLUMNS = "80px 1.6fr 130px";
const MOVEMENT_HEADERS = ["Fecha", "Concepto", "Monto"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const ministryDetailContentMinistriesPage = {
  page: cn("flex flex-col gap-[18px]"),
  hero: cn("flex flex-wrap items-center gap-[22px] rounded-[34px] bg-(--vino) p-[30px]"),
  heroBubble: cn("size-[72px]"),
  heroIcon: cn("size-8"),
  heroBody: cn("flex min-w-60 flex-1 flex-col gap-2"),
  heroKicker: cn("text-[11.5px] font-extrabold tracking-[0.12em] text-[#f2e1b6] uppercase"),
  heroTitle: cn("font-display text-4xl leading-[1.1] font-semibold text-white"),
  heroText: cn("max-w-[640px] text-[14.5px] leading-[1.6] text-white/75"),
  heroActions: cn("flex flex-col gap-2.5"),
  heroEdit: cn("bg-white text-primary"),
  heroDelete: cn("bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"),
  glyph: cn("size-4"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1.5fr_1fr]"),
  column: cn("flex flex-col gap-[18px]"),
  card: cn("p-6"),
  movementsCard: cn("flex flex-col gap-1 p-[22px]"),
  about: cn("mb-4 text-[14.5px] leading-[1.7] text-[var(--tinta-suave)]"),
  fact: cn("flex justify-between gap-3 border-b border-border py-[11px] text-sm"),
  factLabel: cn("text-[var(--tinta-apagada)]"),
  factValue: cn("text-right font-bold"),
  movementDate: cn("text-[var(--tinta-suave)]"),
  movementConcept: cn("flex min-w-0 items-center gap-3"),
  movementBubble: cn("size-[38px]"),
  movementText: cn("flex min-w-0 flex-col gap-0.5"),
  movementName: cn("text-sm font-bold"),
  movementProject: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  expense: cn("text-sm whitespace-nowrap text-primary tabular-nums"),
  income: cn("text-sm whitespace-nowrap text-[var(--vida)] tabular-nums"),
  amountCell: cn("text-right"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  people: cn("flex flex-col gap-3.5"),
  person: cn("flex items-center gap-3"),
  avatar: cn("size-11 text-base font-extrabold shadow-[0_0_0_2px_#fff]"),
  personText: cn("flex flex-1 flex-col"),
  personName: cn("font-bold"),
  personRole: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  figure: cn("font-display text-[34px] font-semibold tabular-nums"),
  figureOf: cn("mt-1 mb-3.5 block text-[13px] text-[var(--tinta-apagada)]"),
  progress: cn("h-3"),
  links: cn("mt-4 flex flex-wrap gap-2.5"),
};

function formatDay(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day} ${MONTHS[Number(month) - 1]}`;
}

export function MinistryDetailContent({ ministry }: MinistryDetailContentProps) {
  const percent = getExecutionPercent(ministry);
  const { icon: HeroIcon, tone } = getMinistryAppearance(ministry.id);
  const facts = [
    { label: "Reuniones", value: ministry.schedule },
    { label: "Edades", value: ministry.ages },
    { label: "Voluntarios", value: `${ministry.volunteers} personas` },
  ];

  return (
    <div className={ministryDetailContentMinistriesPage.page}>
      <section className={ministryDetailContentMinistriesPage.hero}>
        <IconBubble className={ministryDetailContentMinistriesPage.heroBubble} tone="gold">
          <HeroIcon aria-hidden="true" className={ministryDetailContentMinistriesPage.heroIcon} />
        </IconBubble>
        <div className={ministryDetailContentMinistriesPage.heroBody}>
          <span className={ministryDetailContentMinistriesPage.heroKicker}>Ministerio</span>
          <h1 className={ministryDetailContentMinistriesPage.heroTitle}>{ministry.name}</h1>
          <p className={ministryDetailContentMinistriesPage.heroText}>{ministry.description}</p>
        </div>
        <div className={ministryDetailContentMinistriesPage.heroActions}>
          <BoardButton
            className={ministryDetailContentMinistriesPage.heroEdit}
            href={getChurchRoutePath("ministries", ministry.id, "edit")}
          >
            <PencilLine aria-hidden="true" className={ministryDetailContentMinistriesPage.glyph} />
            Editar ministerio
          </BoardButton>
          <MinistryDeleteDialog
            ministryName={ministry.name}
            trigger={
              <BoardButton className={ministryDetailContentMinistriesPage.heroDelete}>
                <Trash2 aria-hidden="true" className={ministryDetailContentMinistriesPage.glyph} />
                Eliminar
              </BoardButton>
            }
          />
        </div>
      </section>

      <div className={ministryDetailContentMinistriesPage.columns}>
        <div className={ministryDetailContentMinistriesPage.column}>
          <BoardCard className={ministryDetailContentMinistriesPage.card}>
            <BoardCardHeader subtitle="Qué hace y cómo se organiza" title="Descripción" />
            <p className={ministryDetailContentMinistriesPage.about}>{ministry.about}</p>
            {facts.map((fact) => (
              <div className={ministryDetailContentMinistriesPage.fact} key={fact.label}>
                <span className={ministryDetailContentMinistriesPage.factLabel}>{fact.label}</span>
                <b className={ministryDetailContentMinistriesPage.factValue}>{fact.value}</b>
              </div>
            ))}
          </BoardCard>

          <BoardCard className={ministryDetailContentMinistriesPage.movementsCard}>
            <BoardCardHeader
              subtitle="Gastos asociados al ministerio"
              title="Últimos movimientos"
            />
            {ministry.movements.length === 0 ? (
              <p className={ministryDetailContentMinistriesPage.empty}>
                Todavía no hay movimientos.
              </p>
            ) : (
              <>
                <BoardTableHead columns={MOVEMENT_COLUMNS} labels={MOVEMENT_HEADERS} />
                <BoardTableList>
                  {ministry.movements.map((movement) => {
                    const isExpense = movement.amount < 0;
                    return (
                      <BoardTableRow columns={MOVEMENT_COLUMNS} key={movement.id}>
                        <span className={ministryDetailContentMinistriesPage.movementDate}>
                          {formatDay(movement.date)}
                        </span>
                        <div className={ministryDetailContentMinistriesPage.movementConcept}>
                          <IconBubble
                            className={ministryDetailContentMinistriesPage.movementBubble}
                            tone={isExpense ? "rose" : "green"}
                          >
                            {isExpense ? (
                              <CircleDollarSign
                                aria-hidden="true"
                                className={ministryDetailContentMinistriesPage.glyph}
                              />
                            ) : (
                              <Heart
                                aria-hidden="true"
                                className={ministryDetailContentMinistriesPage.glyph}
                              />
                            )}
                          </IconBubble>
                          <div className={ministryDetailContentMinistriesPage.movementText}>
                            <span className={ministryDetailContentMinistriesPage.movementName}>
                              {movement.concept}
                            </span>
                            <span className={ministryDetailContentMinistriesPage.movementProject}>
                              {movement.project}
                            </span>
                          </div>
                        </div>
                        <div className={ministryDetailContentMinistriesPage.amountCell}>
                          <b
                            className={
                              isExpense
                                ? ministryDetailContentMinistriesPage.expense
                                : ministryDetailContentMinistriesPage.income
                            }
                          >
                            {isExpense ? "−" : "+"}{" "}
                            {formatMoney(ministry.currency, Math.abs(movement.amount))}
                          </b>
                        </div>
                      </BoardTableRow>
                    );
                  })}
                </BoardTableList>
              </>
            )}
          </BoardCard>
        </div>

        <div className={ministryDetailContentMinistriesPage.column}>
          <BoardCard className={ministryDetailContentMinistriesPage.card}>
            <BoardCardHeader title="Liderazgo" />
            <div className={ministryDetailContentMinistriesPage.people}>
              <div className={ministryDetailContentMinistriesPage.person}>
                <IconBubble className={ministryDetailContentMinistriesPage.avatar} tone={tone}>
                  {getLeaderInitials(ministry.leaderName)}
                </IconBubble>
                <div className={ministryDetailContentMinistriesPage.personText}>
                  <b className={ministryDetailContentMinistriesPage.personName}>
                    {ministry.leaderName}
                  </b>
                  <span className={ministryDetailContentMinistriesPage.personRole}>
                    Líder · desde {ministry.leaderSince}
                  </span>
                </div>
                <RowIconButton href="#" label={`Escribir a ${ministry.leaderName}`}>
                  <Mail aria-hidden="true" className={ministryDetailContentMinistriesPage.glyph} />
                </RowIconButton>
              </div>
              {ministry.coLeaderName ? (
                <div className={ministryDetailContentMinistriesPage.person}>
                  <IconBubble className={ministryDetailContentMinistriesPage.avatar} tone="gold">
                    {getLeaderInitials(ministry.coLeaderName)}
                  </IconBubble>
                  <div className={ministryDetailContentMinistriesPage.personText}>
                    <b className={ministryDetailContentMinistriesPage.personName}>
                      {ministry.coLeaderName}
                    </b>
                    <span className={ministryDetailContentMinistriesPage.personRole}>Co-líder</span>
                  </div>
                  <RowIconButton href="#" label={`Escribir a ${ministry.coLeaderName}`}>
                    <Mail
                      aria-hidden="true"
                      className={ministryDetailContentMinistriesPage.glyph}
                    />
                  </RowIconButton>
                </div>
              ) : null}
            </div>
          </BoardCard>

          <BoardCard className={ministryDetailContentMinistriesPage.card}>
            <BoardCardHeader subtitle="Ejecución del año" title="Presupuesto" />
            <b className={ministryDetailContentMinistriesPage.figure}>
              {formatMoney(ministry.currency, ministry.executed)}
            </b>
            <span className={ministryDetailContentMinistriesPage.figureOf}>
              de {formatMoney(ministry.currency, ministry.budget)} asignados
            </span>
            <ProgressBar
              className={ministryDetailContentMinistriesPage.progress}
              label={`Presupuesto ejecutado: ${percent} %`}
              tone={getExecutionTone(percent)}
              value={percent}
            />
            <div className={ministryDetailContentMinistriesPage.links}>
              <BoardButton href={getChurchRoutePath("budgets")} size="sm" variant="outline">
                <ArrowUpRight
                  aria-hidden="true"
                  className={ministryDetailContentMinistriesPage.glyph}
                />
                Ver presupuesto
              </BoardButton>
              <BoardButton href={getChurchRoutePath("movements")} size="sm" variant="soft">
                <ArrowLeftRight
                  aria-hidden="true"
                  className={ministryDetailContentMinistriesPage.glyph}
                />
                Ver movimientos
              </BoardButton>
            </div>
          </BoardCard>
        </div>
      </div>
    </div>
  );
}
