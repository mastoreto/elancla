import { ArrowLeft } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { cn } from "@/lib/utils";
import { getVotingListPath } from "../voting-routes";

const votingMissingVotingPage = {
  card: cn("mx-auto flex max-w-lg flex-col items-center gap-3 p-10 text-center"),
  title: cn("font-display text-2xl font-medium"),
  text: cn("text-sm text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
};

/** Shown while the votings load or when the id does not match any record. */
export function VotingMissing() {
  return (
    <BoardCard className={votingMissingVotingPage.card}>
      <h1 className={votingMissingVotingPage.title}>No encontramos esta votación</h1>
      <p className={votingMissingVotingPage.text}>
        Puede haber sido eliminada o el enlace no es correcto.
      </p>
      <BoardButton href={getVotingListPath()} variant="outline">
        <ArrowLeft aria-hidden="true" className={votingMissingVotingPage.icon} />
        Volver a votaciones
      </BoardButton>
    </BoardCard>
  );
}
