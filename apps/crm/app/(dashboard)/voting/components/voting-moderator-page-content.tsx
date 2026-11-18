"use client";

import {
  ArrowLeft,
  Bell,
  Eye,
  FileDown,
  Gavel,
  Lock,
  Pause,
  Play,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import {
  BoardTableHead,
  BoardTableList,
  BoardTableRow,
} from "@/components/dashboard/board/board-table";
import { FilterChip } from "@/components/dashboard/board/filter-chip";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import { votingParticipants } from "../data/voting-participants";
import { useVotingCollection } from "../use-voting-data";
import { getPresencePercent } from "../utils/voting-view";
import { getVotingDetailPath } from "../voting-routes";
import { VotingMissing } from "./voting-missing";
import { VotingOptionBars } from "./voting-option-bars";
import { VotingQuorumSegments } from "./voting-quorum-segments";
import { VotingStatusPill } from "./voting-status-pill";

const PARTICIPANT_COLUMNS = "1.4fr 140px 80px";
const PARTICIPANT_HEADERS = ["Persona", "Estado", "Hora"];
const AVATAR_TONES = ["rose", "gold", "green"] as const;

const votingModeratorPageContentVotingPage = {
  page: cn("flex flex-col gap-5"),
  header: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  back: cn("ml-auto"),
  columns: cn("grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1.5fr_1fr]"),
  stack: cn("flex flex-col gap-[18px]"),
  control: cn("rounded-[30px] bg-(--vino) p-7"),
  controlHeader: cn("mb-4 flex items-center gap-3"),
  controlBubble: cn("size-11"),
  controlText: cn("flex flex-1 flex-col"),
  controlTitle: cn("font-display text-[22px] font-medium text-white"),
  controlSubtitle: cn("text-[13px] text-white/65"),
  controlActions: cn("flex flex-wrap gap-2.5"),
  close: cn("bg-white text-primary"),
  glass: cn("bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"),
  quorum: cn("mt-[22px] flex flex-col gap-2"),
  quorumRow: cn("flex justify-between text-[13.5px] text-white"),
  quorumValue: cn("font-bold text-[#f2e1b6]"),
  card: cn("p-[22px]"),
  list: cn("flex flex-col gap-1"),
  person: cn("flex min-w-0 items-center gap-2.5"),
  avatar: cn("size-[34px] text-xs font-extrabold shadow-[0_0_0_2px_#fff]"),
  personName: cn("text-sm font-medium"),
  time: cn("text-[var(--tinta-suave)]"),
  locked: cn(
    "flex flex-col items-center gap-3 rounded-3xl bg-secondary p-5 text-center",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)]",
  ),
  lockedBubble: cn("size-14"),
  lockedTitle: cn("font-display text-[21px] font-medium"),
  lockedText: cn("max-w-60 text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
  actions: cn("flex flex-col gap-2.5"),
  action: cn("w-full"),
  icon: cn("size-4"),
};

export function VotingModeratorPageContent({ votingId }: { votingId: string }) {
  const { votings, updateVotingStatus } = useVotingCollection({ live: true });
  const [paused, setPaused] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const voting = votings.find((record) => record.id === votingId);

  if (!voting) {
    return <VotingMissing />;
  }

  const isOpen = voting.status === "open";
  const participants = onlyPending
    ? votingParticipants.filter((participant) => participant.votedAt === null)
    : votingParticipants;
  const percent = getPresencePercent(voting);

  return (
    <div className={votingModeratorPageContentVotingPage.page}>
      <div className={votingModeratorPageContentVotingPage.header}>
        <p className={votingModeratorPageContentVotingPage.description}>
          Controla la sesión, el quórum y la participación mientras se vota.
        </p>
        <BoardButton
          className={votingModeratorPageContentVotingPage.back}
          href={getVotingDetailPath(voting.id)}
          variant="outline"
        >
          <ArrowLeft aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
          Volver al resumen
        </BoardButton>
      </div>

      <div className={votingModeratorPageContentVotingPage.columns}>
        <div className={votingModeratorPageContentVotingPage.stack}>
          <section className={votingModeratorPageContentVotingPage.control}>
            <div className={votingModeratorPageContentVotingPage.controlHeader}>
              <IconBubble
                className={votingModeratorPageContentVotingPage.controlBubble}
                tone="gold"
              >
                <Gavel aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
              </IconBubble>
              <div className={votingModeratorPageContentVotingPage.controlText}>
                <b className={votingModeratorPageContentVotingPage.controlTitle}>
                  Control de la sesión
                </b>
                <span className={votingModeratorPageContentVotingPage.controlSubtitle}>
                  {voting.title}
                </span>
              </div>
              <VotingStatusPill
                label={paused && isOpen ? "En pausa" : undefined}
                status={voting.status}
              />
            </div>
            <div className={votingModeratorPageContentVotingPage.controlActions}>
              {isOpen ? (
                <BoardButton
                  className={votingModeratorPageContentVotingPage.close}
                  onClick={() => updateVotingStatus(voting.id, "closed")}
                >
                  <X aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                  Cerrar votación
                </BoardButton>
              ) : (
                <BoardButton
                  className={votingModeratorPageContentVotingPage.close}
                  onClick={() => updateVotingStatus(voting.id, "open")}
                >
                  <Play aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                  {voting.status === "closed" ? "Reabrir votación" : "Abrir votación"}
                </BoardButton>
              )}
              <BoardButton
                className={votingModeratorPageContentVotingPage.glass}
                disabled={!isOpen}
                onClick={() => setPaused((current) => !current)}
              >
                {paused ? (
                  <Play aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                ) : (
                  <Pause aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                )}
                {paused ? "Reanudar" : "Pausar"}
              </BoardButton>
              <BoardButton
                className={votingModeratorPageContentVotingPage.glass}
                onClick={() => setResultsVisible((current) => !current)}
              >
                <Eye aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                {resultsVisible ? "Ocultar resultados" : "Mostrar resultados"}
              </BoardButton>
            </div>
            <div className={votingModeratorPageContentVotingPage.quorum}>
              <div className={votingModeratorPageContentVotingPage.quorumRow}>
                <b>Quórum sobre presentes</b>
                <span className={votingModeratorPageContentVotingPage.quorumValue}>
                  {voting.presentUsers} de {voting.enabledUsers} · {percent} %
                </span>
              </div>
              <VotingQuorumSegments percent={percent} />
            </div>
          </section>

          <BoardCard className={votingModeratorPageContentVotingPage.card}>
            <BoardCardHeader
              action={
                <FilterChip
                  active={onlyPending}
                  onClick={() => setOnlyPending((current) => !current)}
                >
                  <Eye aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                  Solo pendientes
                </FilterChip>
              }
              subtitle="Quién ya votó (sin mostrar su elección)"
              title="Participación"
            />
            <BoardTableHead columns={PARTICIPANT_COLUMNS} labels={PARTICIPANT_HEADERS} />
            <BoardTableList>
              {participants.map((participant, index) => (
                <BoardTableRow columns={PARTICIPANT_COLUMNS} key={participant.id}>
                  <div className={votingModeratorPageContentVotingPage.person}>
                    <IconBubble
                      className={votingModeratorPageContentVotingPage.avatar}
                      tone={AVATAR_TONES[index % AVATAR_TONES.length] ?? "rose"}
                    >
                      {participant.initials}
                    </IconBubble>
                    <span className={votingModeratorPageContentVotingPage.personName}>
                      {participant.name}
                    </span>
                  </div>
                  <span>
                    <StatusPill tone={participant.votedAt ? "green" : "gold"}>
                      {participant.votedAt ? "Votó" : "Pendiente"}
                    </StatusPill>
                  </span>
                  <span className={votingModeratorPageContentVotingPage.time}>
                    {participant.votedAt ?? "—"}
                  </span>
                </BoardTableRow>
              ))}
            </BoardTableList>
          </BoardCard>
        </div>

        <div className={votingModeratorPageContentVotingPage.stack}>
          <BoardCard className={votingModeratorPageContentVotingPage.card}>
            <BoardCardHeader
              subtitle={
                resultsVisible
                  ? "Parciales visibles solo para moderación"
                  : "Ocultos mientras la sesión está abierta"
              }
              title="Resultados al cerrar"
            />
            {resultsVisible || voting.status === "closed" ? (
              <VotingOptionBars voting={voting} />
            ) : (
              <div className={votingModeratorPageContentVotingPage.locked}>
                <IconBubble
                  className={votingModeratorPageContentVotingPage.lockedBubble}
                  tone="gold"
                >
                  <Lock aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                </IconBubble>
                <b className={votingModeratorPageContentVotingPage.lockedTitle}>
                  Resultados bloqueados
                </b>
                <span className={votingModeratorPageContentVotingPage.lockedText}>
                  Se revelan automáticamente al cerrar la votación.
                </span>
              </div>
            )}
          </BoardCard>
          <BoardCard className={votingModeratorPageContentVotingPage.card}>
            <BoardCardHeader title="Acciones del moderador" />
            <div className={votingModeratorPageContentVotingPage.actions}>
              <BoardButton className={votingModeratorPageContentVotingPage.action} variant="soft">
                <Bell aria-hidden="true" className={votingModeratorPageContentVotingPage.icon} />
                Recordar voto pendiente
              </BoardButton>
              <BoardButton
                className={votingModeratorPageContentVotingPage.action}
                variant="outline"
              >
                <UserPlus
                  aria-hidden="true"
                  className={votingModeratorPageContentVotingPage.icon}
                />
                Agregar asistente
              </BoardButton>
              <BoardButton
                className={votingModeratorPageContentVotingPage.action}
                variant="outline"
              >
                <FileDown
                  aria-hidden="true"
                  className={votingModeratorPageContentVotingPage.icon}
                />
                Exportar acta
              </BoardButton>
            </div>
          </BoardCard>
        </div>
      </div>
    </div>
  );
}
