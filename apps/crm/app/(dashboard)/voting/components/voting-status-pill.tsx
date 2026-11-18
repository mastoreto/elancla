import { StatusPill } from "@/components/dashboard/board/status-pill";
import type { VotingStatus } from "../types";
import { VOTING_STATUS_PILL } from "../utils/voting-view";

interface VotingStatusPillProps {
  status: VotingStatus;
  /** Overrides the board label, e.g. "En pausa" for an open vote that is paused. */
  label?: string;
}

export function VotingStatusPill({ status, label }: VotingStatusPillProps) {
  const { label: defaultLabel, tone } = VOTING_STATUS_PILL[status];
  return <StatusPill tone={tone}>{label ?? defaultLabel}</StatusPill>;
}
