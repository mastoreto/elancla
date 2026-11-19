"use client";

import { ArrowUpRight, CircleCheck, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import { ProgressBar } from "@/components/dashboard/board/progress-bar";
import { SearchField } from "@/components/dashboard/board/search-field";
import { StatCard, StatCardGrid } from "@/components/dashboard/board/stat-card";
import { Can } from "@/lib/authz/Gate";
import { cn } from "@/lib/utils";
import type { VotingStatus } from "../types";
import { useVotingCollection } from "../use-voting-data";
import {
  filterVotings,
  getPresencePercent,
  summarizeVotings,
  type VotingFilter,
} from "../utils/voting-view";
import { majorityTypeLabels } from "../voting-config";
import { getVotingCreatePath, getVotingDetailPath } from "../voting-routes";
import { VotingStatusPill } from "./voting-status-pill";

const FILTER_CHIPS: { value: VotingFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "open", label: "En curso" },
  { value: "draft", label: "Programadas" },
  { value: "closed", label: "Cerradas" },
];

const BUBBLE_TONE = {
  open: "green",
  draft: "gold",
  closed: "ink",
} satisfies Record<VotingStatus, IconBubbleTone>;

const QUORUM_TONE = { open: "green", draft: "rose", closed: "rose" } as const;

const votingListPageContentVotingPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  action: cn("ml-auto"),
  icon: cn("size-4"),
  toolbar: cn("flex flex-wrap items-center gap-2.5"),
  search: cn("w-full sm:w-[300px]"),
  grid: cn("grid grid-cols-1 gap-4 lg:grid-cols-2"),
  card: cn("flex flex-col p-[22px]"),
  cardHeader: cn("flex items-start gap-3"),
  bubble: cn("size-11"),
  heading: cn("flex min-w-0 flex-1 flex-col gap-[3px]"),
  title: cn("font-display text-xl leading-tight font-medium after:absolute after:inset-0"),
  session: cn("text-[13px] text-[var(--tinta-apagada)]"),
  quorum: cn("mt-4 mb-3.5 flex flex-col gap-1.5"),
  quorumRow: cn("flex justify-between text-[13px] text-[var(--tinta-apagada)]"),
  quorumValue: cn("text-foreground"),
  track: cn("h-2.5"),
  footer: cn("flex items-center gap-2"),
  majority: cn("flex-1 text-[12.5px] text-[var(--tinta-suave)]"),
  open: cn("relative z-10"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function VotingListPageContent() {
  const { votings } = useVotingCollection();
  const [filter, setFilter] = useState<VotingFilter>("all");
  const [search, setSearch] = useState("");

  const summary = useMemo(() => summarizeVotings(votings), [votings]);
  const visible = useMemo(() => filterVotings(votings, filter, search), [votings, filter, search]);
  const openVoting = votings.find((voting) => voting.status === "open");
  const nextScheduled = votings.find((voting) => voting.status === "draft");

  return (
    <div className={votingListPageContentVotingPage.page}>
      <div className={votingListPageContentVotingPage.header}>
        <p className={votingListPageContentVotingPage.description}>
          Decisiones de la iglesia con quórum, mayoría y voto anónimo.
        </p>
        <Can permission="voting:create">
          <BoardButton
            className={votingListPageContentVotingPage.action}
            href={getVotingCreatePath()}
            variant="primary"
          >
            <Plus aria-hidden="true" className={votingListPageContentVotingPage.icon} />
            Crear nueva votación
          </BoardButton>
        </Can>
      </div>

      <StatCardGrid>
        <StatCard
          detail={
            openVoting
              ? `Quórum ${openVoting.presentUsers} de ${openVoting.enabledUsers}`
              : "Ninguna en curso"
          }
          highlighted={true}
          label="Votaciones activas"
          value={String(summary.open)}
        />
        <StatCard
          detail={
            nextScheduled?.scheduledLabel
              ? `Próxima: ${nextScheduled.scheduledLabel}`
              : "Sin fecha próxima"
          }
          label="Programadas"
          value={String(summary.scheduled)}
        />
        <StatCard
          detail={`${summary.approved} aprobadas · ${summary.rejected} rechazadas`}
          label="Cerradas este año"
          value={String(summary.closed)}
        />
        <StatCard
          detail="Presentes sobre habilitados"
          label="Participación media"
          value={`${summary.averagePresence} %`}
        />
      </StatCardGrid>

      <div className={votingListPageContentVotingPage.toolbar}>
        <SearchField
          aria-label="Buscar votación"
          className={votingListPageContentVotingPage.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar votación…"
          value={search}
        />
        {FILTER_CHIPS.map(({ value, label }) => (
          <FilterChip active={filter === value} key={value} onClick={() => setFilter(value)}>
            {label}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={votingListPageContentVotingPage.empty}>No hay votaciones encontradas.</p>
      ) : (
        <div className={votingListPageContentVotingPage.grid}>
          {visible.map((voting) => (
            <BoardCard
              className={cn(votingListPageContentVotingPage.card, "relative")}
              key={voting.id}
            >
              <div className={votingListPageContentVotingPage.cardHeader}>
                <IconBubble
                  className={votingListPageContentVotingPage.bubble}
                  tone={BUBBLE_TONE[voting.status]}
                >
                  <CircleCheck
                    aria-hidden="true"
                    className={votingListPageContentVotingPage.icon}
                  />
                </IconBubble>
                <div className={votingListPageContentVotingPage.heading}>
                  <Link
                    className={votingListPageContentVotingPage.title}
                    href={getVotingDetailPath(voting.id)}
                  >
                    {voting.title}
                  </Link>
                  <span className={votingListPageContentVotingPage.session}>
                    {voting.sessionLabel}
                  </span>
                </div>
                <VotingStatusPill status={voting.status} />
              </div>
              <div className={votingListPageContentVotingPage.quorum}>
                <div className={votingListPageContentVotingPage.quorumRow}>
                  <span>Quórum</span>
                  <b className={votingListPageContentVotingPage.quorumValue}>
                    {voting.presentUsers} de {voting.enabledUsers}
                  </b>
                </div>
                <ProgressBar
                  className={votingListPageContentVotingPage.track}
                  label={`Quórum de ${voting.title}`}
                  tone={QUORUM_TONE[voting.status]}
                  value={getPresencePercent(voting)}
                />
              </div>
              <div className={votingListPageContentVotingPage.footer}>
                <span className={votingListPageContentVotingPage.majority}>
                  {majorityTypeLabels[voting.majorityType].replace(" 2/3", "")}
                </span>
                <BoardButton
                  className={votingListPageContentVotingPage.open}
                  href={getVotingDetailPath(voting.id)}
                  size="sm"
                  variant="soft"
                >
                  <ArrowUpRight
                    aria-hidden="true"
                    className={votingListPageContentVotingPage.icon}
                  />
                  Abrir
                </BoardButton>
              </div>
            </BoardCard>
          ))}
        </div>
      )}
    </div>
  );
}
