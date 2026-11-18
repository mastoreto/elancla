"use client";

import { ArrowLeft, CircleCheck, CircleHelp, CircleX, Download } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import {
  getOptionResults,
  getPresencePercent,
  getQuorumRequiredPercent,
  percentOf,
} from "../utils/voting-view";
import { getTotalVotes, getVotingOutcome, majorityTypeLabels } from "../voting-config";
import { getVotingDetailPath } from "../voting-routes";
import { VotingDonut } from "./voting-donut";
import { VotingMissing } from "./voting-missing";
import { VotingOptionBars } from "./voting-option-bars";

type Verdict = "approved" | "rejected" | "partial";

const VERDICT_APPEARANCE = {
  approved: { icon: CircleCheck, tone: "green", surface: "bg-[#e4f1e8]" },
  rejected: { icon: CircleX, tone: "rose", surface: "bg-[var(--granada-50)]" },
  partial: { icon: CircleHelp, tone: "gold", surface: "bg-[var(--oro-50)]" },
} satisfies Record<Verdict, { icon: typeof CircleCheck; tone: IconBubbleTone; surface: string }>;

const votingResultsPageContentVotingPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  back: cn("ml-auto"),
  banner: cn("flex flex-wrap items-center gap-3.5 rounded-[30px] p-6"),
  bannerBubble: cn("size-14"),
  bannerText: cn("flex min-w-60 flex-1 flex-col gap-[3px]"),
  bannerTitle: cn("font-display text-[26px] font-semibold"),
  bannerDetail: cn("text-sm text-[var(--tinta-suave)]"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1.2fr_1fr]"),
  card: cn("p-6"),
  distribution: cn("flex items-center justify-center gap-6"),
  legend: cn("flex flex-col gap-4 text-[12.5px] text-[var(--tinta-suave)]"),
  legendItem: cn("inline-flex items-center gap-[7px]"),
  swatch: cn("size-2.5 rounded-[3px]"),
  icon: cn("size-4"),
};

const SWATCH = { green: "bg-[#276d4c]", rose: "bg-primary", gold: "bg-[#c9a14a]" } as const;

export function VotingResultsPageContent({ votingId }: { votingId: string }) {
  const { votings } = useVotingCollection();
  const voting = votings.find((record) => record.id === votingId);

  if (!voting) {
    return <VotingMissing />;
  }

  const outcome = getVotingOutcome(voting);
  const totalVotes = getTotalVotes(voting);
  const results = getOptionResults(voting);
  const verdict: Verdict =
    voting.status === "closed" ? (outcome.passed ? "approved" : "rejected") : "partial";
  const { icon: VerdictIcon, tone, surface } = VERDICT_APPEARANCE[verdict];
  const presencePercent = getPresencePercent(voting);
  const leading = outcome.leadingOption;
  const leadingPercent = leading ? percentOf(leading.votes, totalVotes) : 0;
  const reading = { approved: "Aprobado", rejected: "Rechazado", partial: "En curso" }[verdict];
  const bannerTitle = {
    approved: `${voting.title} aprobada`,
    rejected: `${voting.title} rechazada`,
    partial: "Resultados parciales",
  }[verdict];

  return (
    <div className={votingResultsPageContentVotingPage.page}>
      <div className={votingResultsPageContentVotingPage.header}>
        <p className={votingResultsPageContentVotingPage.description}>
          Resultado final de la sesión con quórum, mayoría y lectura final.
        </p>
        <BoardButton
          className={votingResultsPageContentVotingPage.back}
          href={getVotingDetailPath(voting.id)}
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className={votingResultsPageContentVotingPage.icon} />
          Volver al resumen
        </BoardButton>
      </div>

      <section className={cn(votingResultsPageContentVotingPage.banner, surface)}>
        <IconBubble className={votingResultsPageContentVotingPage.bannerBubble} tone={tone}>
          <VerdictIcon aria-hidden="true" className={votingResultsPageContentVotingPage.icon} />
        </IconBubble>
        <div className={votingResultsPageContentVotingPage.bannerText}>
          <b className={votingResultsPageContentVotingPage.bannerTitle}>{bannerTitle}</b>
          <span className={votingResultsPageContentVotingPage.bannerDetail}>
            {verdict === "partial"
              ? "La votación sigue abierta; las cifras pueden cambiar hasta el cierre."
              : `Cumple quórum (${presencePercent} %) y ${majorityTypeLabels[voting.majorityType].toLowerCase()} (${leadingPercent} %).`}
          </span>
        </div>
        <BoardButton variant="outline">
          <Download aria-hidden="true" className={votingResultsPageContentVotingPage.icon} />
          Descargar acta
        </BoardButton>
      </section>

      <StatCardGrid>
        <StatCard
          detail={`${totalVotes} de ${Math.max(voting.presentUsers, totalVotes)} presentes`}
          label="Participación efectiva"
          value={`${Math.round(outcome.participationRate)} %`}
        />
        <StatCard
          detail={`Requerido ${getQuorumRequiredPercent(voting)} %`}
          label="Quórum sobre presentes"
          value={`${presencePercent} %`}
        />
        <StatCard
          detail={`${outcome.thresholdLabel} · ${leadingPercent} %`}
          label="Mayoría requerida"
          value={majorityTypeLabels[voting.majorityType]
            .replace("Mayoría ", "")
            .replace(" 2/3", "")
            .replace(/^./, (letter) => letter.toUpperCase())}
        />
        <StatCard
          detail={results
            .slice(0, 2)
            .map(({ option }) => `${option.label} ${option.votes}`)
            .join(" · ")}
          highlighted={true}
          label="Lectura final"
          value={reading}
        />
      </StatCardGrid>

      <div className={votingResultsPageContentVotingPage.columns}>
        <BoardCard className={votingResultsPageContentVotingPage.card}>
          <BoardCardHeader subtitle="Resultado final" title="Detalle por opción" />
          <VotingOptionBars voting={voting} />
        </BoardCard>
        <BoardCard className={votingResultsPageContentVotingPage.card}>
          <BoardCardHeader subtitle="Votos emitidos" title="Distribución" />
          <div className={votingResultsPageContentVotingPage.distribution}>
            <VotingDonut
              slices={results.map(({ option, tone: sliceTone }) => ({
                label: option.label,
                value: option.votes,
                tone: sliceTone,
              }))}
            />
            <div className={votingResultsPageContentVotingPage.legend}>
              {results.map(({ option, percent, tone: legendTone }) => (
                <span className={votingResultsPageContentVotingPage.legendItem} key={option.id}>
                  <span
                    className={cn(votingResultsPageContentVotingPage.swatch, SWATCH[legendTone])}
                  />
                  {option.label} {percent} %
                </span>
              ))}
            </div>
          </div>
        </BoardCard>
      </div>
    </div>
  );
}
