export const votingStatuses = ["draft", "open", "closed"] as const;
export const votingTypes = ["motion", "binary", "list"] as const;
export const majorityTypes = ["simple", "absolute", "qualified"] as const;

export type VotingStatus = (typeof votingStatuses)[number];
export type VotingType = (typeof votingTypes)[number];
export type MajorityType = (typeof majorityTypes)[number];

export interface VotingOption {
  id: string;
  label: string;
  votes: number;
}

export interface VotingRecord {
  id: string;
  title: string;
  summary: string;
  type: VotingType;
  status: VotingStatus;
  options: VotingOption[];
  quorum: number;
  majorityType: MajorityType;
  enabledUsers: number;
  presentUsers: number;
  votesSubmitted: number;
  viewerEnabled: boolean;
  viewerVoteOptionId: string | null;
  createdAt: string;
  openedAt: string | null;
  closedAt: string | null;
  updatedAt: string;
  presenceTargetRatio: number;
  voteTargetRatio: number;
  optionWeights: number[];
}

export interface CreateVotingInput {
  title: string;
  type: VotingType;
  options: string[];
  quorum: number;
  majorityType: MajorityType;
}

export interface VotingOutcome {
  totalVotes: number;
  participationRate: number;
  quorumProgress: number;
  quorumReached: boolean;
  leadingOption: VotingOption | null;
  approvalRate: number;
  passed: boolean;
  resultLabel: "Aprobada" | "Rechazada";
  thresholdLabel: string;
}
