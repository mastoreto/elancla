import type { BoardTimelineItem } from "@/components/dashboard/board/board-timeline";
import type { ProgressBarTone } from "@/components/dashboard/board/progress-bar";
import type { StatusPillTone } from "@/components/dashboard/board/status-pill";
import type { VotingOption, VotingRecord, VotingStatus } from "../types";
import { getTotalVotes, getVotingOutcome } from "../voting-config";

export type VotingFilter = "all" | VotingStatus;

/** Board wording for each status: "Programada" is a draft waiting for its session. */
export const VOTING_STATUS_PILL = {
  open: { label: "En curso", tone: "green" },
  draft: { label: "Programada", tone: "gold" },
  closed: { label: "Cerrada", tone: "ink" },
} satisfies Record<VotingStatus, { label: string; tone: StatusPillTone }>;

const OPTION_TONES: ProgressBarTone[] = ["green", "rose", "gold"];

/** First option reads green, second rose, third gold; extra options repeat gold. */
export function getOptionTone(index: number): ProgressBarTone {
  return OPTION_TONES[Math.min(index, OPTION_TONES.length - 1)] ?? "gold";
}

export function percentOf(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

/** Share of the habilitated roll that is present, rounded. */
export function getPresencePercent(voting: VotingRecord): number {
  return percentOf(voting.presentUsers, voting.enabledUsers);
}

export function getQuorumRequiredPercent(voting: VotingRecord): number {
  return percentOf(voting.quorum, voting.enabledUsers);
}

export function filterVotings(
  votings: readonly VotingRecord[],
  filter: VotingFilter,
  search: string,
): VotingRecord[] {
  const query = search.trim().toLowerCase();
  return votings.filter(
    (voting) =>
      (filter === "all" || voting.status === filter) &&
      (query === "" ||
        voting.title.toLowerCase().includes(query) ||
        voting.sessionLabel.toLowerCase().includes(query)),
  );
}

export interface VotingListSummary {
  open: number;
  scheduled: number;
  closed: number;
  approved: number;
  rejected: number;
  averagePresence: number;
}

export function summarizeVotings(votings: readonly VotingRecord[]): VotingListSummary {
  const closed = votings.filter((voting) => voting.status === "closed");
  const held = votings.filter((voting) => voting.status !== "draft");
  const approved = closed.filter((voting) => getVotingOutcome(voting).passed).length;
  const presenceTotal = held.reduce((sum, voting) => sum + getPresencePercent(voting), 0);

  return {
    open: votings.filter((voting) => voting.status === "open").length,
    scheduled: votings.filter((voting) => voting.status === "draft").length,
    closed: closed.length,
    approved,
    rejected: closed.length - approved,
    averagePresence: held.length === 0 ? 0 : Math.round(presenceTotal / held.length),
  };
}

export interface VotingOptionResult {
  option: VotingOption;
  percent: number;
  tone: ProgressBarTone;
}

export function getOptionResults(voting: VotingRecord): VotingOptionResult[] {
  const total = getTotalVotes(voting);
  return voting.options.map((option, index) => ({
    option,
    percent: percentOf(option.votes, total),
    tone: getOptionTone(index),
  }));
}

function formatClock(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export type VotingActivityKind = "quorum" | "opened" | "accreditation" | "closed";

export interface VotingActivityEntry {
  id: VotingActivityKind;
  kind: VotingActivityKind;
  title: string;
  detail: string;
  time: string;
}

/** Newest first. Times are shown in UTC so the seed clock reads the same everywhere. */
export function getVotingActivity(voting: VotingRecord): VotingActivityEntry[] {
  const entries: VotingActivityEntry[] = [];

  if (voting.closedAt) {
    entries.push({
      id: "closed",
      kind: "closed",
      title: "Votación cerrada",
      detail: `${getTotalVotes(voting)} votos registrados`,
      time: formatClock(voting.closedAt),
    });
  }
  if (voting.presentUsers >= voting.quorum && voting.openedAt) {
    entries.push({
      id: "quorum",
      kind: "quorum",
      title: "Quórum alcanzado",
      detail: `${voting.presentUsers} de ${voting.enabledUsers} presentes habilitados`,
      time: formatClock(voting.updatedAt),
    });
  }
  if (voting.openedAt) {
    entries.push({
      id: "opened",
      kind: "opened",
      title: "Votación abierta",
      detail: `Moderador: ${voting.moderatorName}`,
      time: formatClock(voting.openedAt),
    });
    entries.push({
      id: "accreditation",
      kind: "accreditation",
      title: "Acreditación abierta",
      detail: "Ingreso de asistentes",
      time: formatClock(new Date(new Date(voting.openedAt).getTime() - 45 * 60_000).toISOString()),
    });
  }

  return entries;
}

export type ActivityTimelineItem = Pick<BoardTimelineItem, "id" | "title" | "detail" | "time">;
