"use client";

import {
  ChartColumn,
  Check,
  ClipboardList,
  Gavel,
  Radio,
  Smartphone,
  UserCheck,
} from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardTimeline, type BoardTimelineItem } from "@/components/dashboard/board/board-timeline";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import {
  getPresencePercent,
  getQuorumRequiredPercent,
  getVotingActivity,
  percentOf,
  type VotingActivityKind,
} from "../utils/voting-view";
import { getTotalVotes, getVotingOutcome, majorityTypeLabels } from "../voting-config";
import { getVotingModeratorPath, getVotingResultsPath, getVotingVotePath } from "../voting-routes";
import { VotingMissing } from "./voting-missing";
import { VotingOptionBars } from "./voting-option-bars";
import { VotingStatusPill } from "./voting-status-pill";

const MAJORITY_HINT = {
  simple: "50 % + 1 de los votos válidos",
  absolute: "50 % del padrón habilitado",
  qualified: "2/3 de los votos emitidos",
} as const;

const ACTIVITY_APPEARANCE = {
  quorum: { icon: Check, tone: "green" },
  opened: { icon: Gavel, tone: "gold" },
  accreditation: { icon: UserCheck, tone: "ink" },
  closed: { icon: ClipboardList, tone: "rose" },
} satisfies Record<VotingActivityKind, Pick<BoardTimelineItem, "icon" | "tone">>;

const OPERATING_LABEL = {
  open: "Sesión en vivo",
  draft: "Sesión programada",
  closed: "Sesión cerrada",
} as const;

const votingOverviewPageContentVotingPage = {
  page: cn("flex flex-col gap-[18px]"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] xl:grid-cols-3"),
  card: cn("p-6"),
  stack: cn("flex flex-col gap-[18px]"),
  facts: cn("flex flex-col gap-4"),
  quorumBlock: cn("flex flex-col gap-2"),
  quorumRow: cn("flex justify-between text-[13.5px]"),
  quorumOk: cn("font-bold text-[var(--vida)]"),
  quorumMissing: cn("font-bold text-[var(--oro-texto)]"),
  quorumTrack: cn("h-3.5"),
  fact: cn("flex justify-between gap-3 border-b border-border py-[11px] text-sm"),
  factLabel: cn("text-[var(--tinta-apagada)]"),
  factValue: cn("text-right font-bold"),
  actions: cn("flex flex-col gap-2.5"),
  action: cn("w-full"),
  icon: cn("size-4"),
};

export function VotingOverviewPageContent({ votingId }: { votingId: string }) {
  const { votings } = useVotingCollection({ live: true });
  const voting = votings.find((record) => record.id === votingId);

  if (!voting) {
    return <VotingMissing />;
  }

  const outcome = getVotingOutcome(voting);
  const totalVotes = getTotalVotes(voting);
  const presencePercent = getPresencePercent(voting);
  const projected = outcome.leadingOption;
  const projectedPercent = projected ? percentOf(projected.votes, totalVotes) : 0;
  const activity: BoardTimelineItem[] = getVotingActivity(voting).map((entry) => ({
    id: entry.id,
    ...ACTIVITY_APPEARANCE[entry.kind],
    title: entry.title,
    detail: entry.detail,
    time: entry.time,
  }));

  return (
    <div className={votingOverviewPageContentVotingPage.page}>
      <StatCardGrid>
        <StatCard
          detail={`${presencePercent} % · requerido ${getQuorumRequiredPercent(voting)} %`}
          label="Quórum"
          value={`${voting.presentUsers} / ${voting.enabledUsers}`}
        />
        <StatCard
          detail={`Participación ${Math.round(outcome.participationRate)} % de presentes`}
          label="Votos emitidos"
          value={String(totalVotes)}
        />
        <StatCard
          detail={MAJORITY_HINT[voting.majorityType]}
          label="Mayoría requerida"
          value={majorityTypeLabels[voting.majorityType]
            .replace("Mayoría ", "")
            .replace(" 2/3", "")
            .replace(/^./, (letter) => letter.toUpperCase())}
        />
        <StatCard
          detail={`${projectedPercent} % con ${totalVotes} votos`}
          highlighted={true}
          label="Resultado proyectado"
          value={projected?.label ?? "—"}
        />
      </StatCardGrid>

      <div className={votingOverviewPageContentVotingPage.columns}>
        <BoardCard className={votingOverviewPageContentVotingPage.card}>
          <BoardCardHeader
            action={<VotingStatusPill status={voting.status} />}
            subtitle={OPERATING_LABEL[voting.status]}
            title="Estado operativo"
          />
          <div className={votingOverviewPageContentVotingPage.facts}>
            <div className={votingOverviewPageContentVotingPage.quorumBlock}>
              <div className={votingOverviewPageContentVotingPage.quorumRow}>
                <b>Avance de quórum</b>
                <span
                  className={
                    outcome.quorumReached
                      ? votingOverviewPageContentVotingPage.quorumOk
                      : votingOverviewPageContentVotingPage.quorumMissing
                  }
                >
                  {outcome.quorumReached ? "Quórum alcanzado" : "Quórum pendiente"}
                </span>
              </div>
              <ProgressBar
                className={votingOverviewPageContentVotingPage.quorumTrack}
                label={`Avance de quórum: ${presencePercent} %`}
                tone={outcome.quorumReached ? "green" : "gold"}
                value={presencePercent}
              />
            </div>
            <div>
              {[
                { label: "Voto", value: voting.anonymous ? "Anónimo" : "Nominal" },
                { label: "Opciones visibles", value: String(voting.options.length) },
                { label: "Última actualización", value: "hace 12 s" },
              ].map((fact) => (
                <div className={votingOverviewPageContentVotingPage.fact} key={fact.label}>
                  <span className={votingOverviewPageContentVotingPage.factLabel}>
                    {fact.label}
                  </span>
                  <b className={votingOverviewPageContentVotingPage.factValue}>{fact.value}</b>
                </div>
              ))}
            </div>
          </div>
        </BoardCard>

        <BoardCard className={votingOverviewPageContentVotingPage.card}>
          <BoardCardHeader subtitle="Resultados parciales" title="Detalle por opción" />
          <VotingOptionBars voting={voting} />
        </BoardCard>

        <div className={votingOverviewPageContentVotingPage.stack}>
          <BoardCard className={votingOverviewPageContentVotingPage.card}>
            <BoardCardHeader title="Acciones rápidas" />
            <div className={votingOverviewPageContentVotingPage.actions}>
              <BoardButton
                className={votingOverviewPageContentVotingPage.action}
                href={getVotingModeratorPath(voting.id)}
                variant="primary"
              >
                <Radio aria-hidden="true" className={votingOverviewPageContentVotingPage.icon} />
                Modo moderación en vivo
              </BoardButton>
              <BoardButton
                className={votingOverviewPageContentVotingPage.action}
                href={getVotingVotePath(voting.id)}
                variant="outline"
              >
                <Smartphone
                  aria-hidden="true"
                  className={votingOverviewPageContentVotingPage.icon}
                />
                Pantalla de votación
              </BoardButton>
              <BoardButton
                className={votingOverviewPageContentVotingPage.action}
                href={getVotingResultsPath(voting.id)}
                variant="outline"
              >
                <ChartColumn
                  aria-hidden="true"
                  className={votingOverviewPageContentVotingPage.icon}
                />
                Ir a resultados
              </BoardButton>
            </div>
          </BoardCard>
          <BoardCard className={votingOverviewPageContentVotingPage.card}>
            <BoardCardHeader title="Actividad reciente" />
            <BoardTimeline items={activity} />
          </BoardCard>
        </div>
      </div>
    </div>
  );
}
