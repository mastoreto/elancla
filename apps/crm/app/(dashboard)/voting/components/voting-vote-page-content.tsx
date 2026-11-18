"use client";

import { Check, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import { getVotingListPath } from "../voting-routes";
import { VotingMissing } from "./voting-missing";
import { VotingStatusPill } from "./voting-status-pill";

const votingVotePageContentVotingPage = {
  stage: cn("flex justify-center py-4"),
  phone: cn(
    "flex min-h-[720px] w-full max-w-[390px] flex-col overflow-hidden rounded-[44px] bg-background",
    "shadow-[0_30px_60px_-30px_rgba(60,20,30,0.45),0_0_0_10px_var(--foreground)]",
  ),
  screen: cn("flex flex-1 flex-col gap-[18px] px-6 py-7"),
  brandRow: cn("flex items-center gap-2.5"),
  brandMark: cn(
    "inline-flex size-9 items-center justify-center rounded-xl bg-(image:--grad-granada) text-white",
    "shadow-[0_8px_18px_-8px_rgba(194,58,78,0.9)]",
  ),
  brandName: cn("font-display text-[21px] font-semibold tracking-tight"),
  spacer: cn("flex-1"),
  kicker: cn("mt-2.5 text-[11.5px] font-extrabold tracking-[0.12em] text-primary uppercase"),
  title: cn("font-display text-3xl leading-[1.1] font-semibold tracking-tight"),
  text: cn("text-sm leading-[1.55] text-[var(--tinta-suave)]"),
  options: cn("mt-1.5 flex flex-col gap-2.5"),
  option: cn(
    "flex items-center gap-3.5 rounded-[26px] bg-card p-[18px] text-left text-base font-bold",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition disabled:opacity-70",
  ),
  optionActive: cn("bg-(--granada-50) shadow-[inset_0_0_0_2px_var(--granada)]"),
  radio: cn(
    "size-[26px] shrink-0 rounded-full bg-card shadow-[inset_0_0_0_1.5px_rgba(42,21,26,0.16)]",
  ),
  radioActive: cn("shadow-[inset_0_0_0_8px_var(--granada)]"),
  confirm: cn("w-full"),
  hint: cn("text-center text-xs text-[var(--tinta-apagada)]"),
  result: cn("items-center justify-center text-center"),
  resultBubble: cn("size-[92px]"),
  resultIcon: cn("size-10"),
  resultTitle: cn("font-display text-[32px] font-semibold tracking-tight"),
  resultText: cn("max-w-[280px] text-[15px] leading-[1.55] text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
};

export function VotingVotePageContent({ votingId }: { votingId: string }) {
  const { votings, castViewerVote } = useVotingCollection({ live: true });
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const voting = votings.find((record) => record.id === votingId);

  if (!voting) {
    return <VotingMissing />;
  }

  const recorded = voting.viewerVoteOptionId !== null;
  const canVote = voting.status === "open" && voting.viewerEnabled && !recorded;
  const selected = voting.options.find((option) => option.id === selectedOptionId);

  const renderBody = () => {
    if (recorded) {
      return (
        <div
          className={cn(
            votingVotePageContentVotingPage.screen,
            votingVotePageContentVotingPage.result,
          )}
        >
          <IconBubble className={votingVotePageContentVotingPage.resultBubble} tone="green">
            <Check aria-hidden="true" className={votingVotePageContentVotingPage.resultIcon} />
          </IconBubble>
          <b className={votingVotePageContentVotingPage.resultTitle}>Tu voto ya fue registrado</b>
          <span className={votingVotePageContentVotingPage.resultText}>
            Gracias por participar. Los resultados se mostrarán cuando el moderador cierre la
            votación.
          </span>
          <BoardButton href={getVotingListPath()} variant="outline">
            Volver al listado
          </BoardButton>
        </div>
      );
    }

    if (!voting.viewerEnabled) {
      return (
        <div
          className={cn(
            votingVotePageContentVotingPage.screen,
            votingVotePageContentVotingPage.result,
          )}
        >
          <IconBubble className={votingVotePageContentVotingPage.resultBubble} tone="gold">
            <Lock aria-hidden="true" className={votingVotePageContentVotingPage.resultIcon} />
          </IconBubble>
          <b className={votingVotePageContentVotingPage.resultTitle}>No habilitado para votar</b>
          <span className={votingVotePageContentVotingPage.resultText}>
            Tu cuenta no figura entre los asistentes acreditados. Habla con el moderador.
          </span>
          <BoardButton variant="soft">Pedir acceso</BoardButton>
        </div>
      );
    }

    return (
      <div className={votingVotePageContentVotingPage.screen}>
        <div className={votingVotePageContentVotingPage.brandRow}>
          <span className={votingVotePageContentVotingPage.brandMark}>
            <ShieldCheck aria-hidden="true" className={votingVotePageContentVotingPage.icon} />
          </span>
          <b className={votingVotePageContentVotingPage.brandName}>iEkklesia</b>
          <span className={votingVotePageContentVotingPage.spacer} />
          <VotingStatusPill status={voting.status} />
        </div>
        <span className={votingVotePageContentVotingPage.kicker}>Pantalla de votación</span>
        <b className={votingVotePageContentVotingPage.title}>{voting.title}</b>
        <span className={votingVotePageContentVotingPage.text}>
          Elige una opción. Tu voto es {voting.anonymous ? "anónimo" : "nominal"} y no se puede
          cambiar.
        </span>
        <div className={votingVotePageContentVotingPage.options}>
          {voting.options.map((option) => {
            const active = option.id === selectedOptionId;
            return (
              <button
                aria-pressed={active}
                className={cn(
                  votingVotePageContentVotingPage.option,
                  active && votingVotePageContentVotingPage.optionActive,
                )}
                disabled={!canVote}
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                type="button"
              >
                <span
                  className={cn(
                    votingVotePageContentVotingPage.radio,
                    active && votingVotePageContentVotingPage.radioActive,
                  )}
                />
                {option.label}
              </button>
            );
          })}
        </div>
        <span className={votingVotePageContentVotingPage.spacer} />
        <BoardButton
          className={votingVotePageContentVotingPage.confirm}
          disabled={!selected || !canVote}
          onClick={() => selected && castViewerVote(voting.id, selected.id)}
          size="lg"
          variant="primary"
        >
          <Check aria-hidden="true" className={votingVotePageContentVotingPage.icon} />
          Confirmar mi voto
        </BoardButton>
        <span className={votingVotePageContentVotingPage.hint}>
          {voting.status === "open" ? (
            "Toca para seleccionar esta opción."
          ) : (
            <Link href={getVotingListPath()}>La votación no está abierta. Volver al listado</Link>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className={votingVotePageContentVotingPage.stage}>
      <div className={votingVotePageContentVotingPage.phone}>{renderBody()}</div>
    </div>
  );
}
