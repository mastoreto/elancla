import type {
  CreateVotingInput,
  MajorityType,
  VotingOption,
  VotingOutcome,
  VotingRecord,
  VotingStatus,
  VotingType,
} from "./types";

export const votingTypeLabels: Record<VotingType, string> = {
  motion: "Moción",
  binary: "Binaria",
  list: "Lista",
};

export const votingStatusLabels: Record<VotingStatus, string> = {
  draft: "Borrador",
  open: "Abierta",
  closed: "Cerrada",
};

export const majorityTypeLabels: Record<MajorityType, string> = {
  simple: "Mayoría simple",
  absolute: "Mayoría absoluta",
  qualified: "Mayoría calificada 2/3",
};

export const defaultOptionLabelsByType: Record<VotingType, string[]> = {
  motion: ["A favor", "En contra", "Abstención"],
  binary: ["Sí", "No"],
  list: ["Opción A", "Opción B", "Opción C"],
};

const defaultEnabledUsers = 120;
export const defaultModeratorName = "Pastor Daniel Rivas";

function createOption(label: string, votes = 0, index = 0): VotingOption {
  return {
    id: `${slugify(label)}-${index + 1}`,
    label,
    votes,
  };
}

function createWeights(type: VotingType, optionCount: number) {
  if (type === "binary") {
    return [0.58, 0.42].slice(0, optionCount);
  }

  if (type === "list") {
    return Array.from({ length: optionCount }, (_, index) => Math.max(0.2, 0.48 - index * 0.1));
  }

  return [0.55, 0.28, 0.17].slice(0, optionCount);
}

function createVotingRecord(input: {
  id: string;
  title: string;
  summary: string;
  sessionLabel: string;
  scheduledLabel?: string | null;
  moderatorName?: string;
  type: VotingType;
  status: VotingStatus;
  options: Array<{ label: string; votes?: number }>;
  quorum: number;
  majorityType: MajorityType;
  enabledUsers: number;
  presentUsers: number;
  votesSubmitted: number;
  viewerEnabled: boolean;
  viewerVoteOptionId?: string | null;
  createdAt: string;
  openedAt?: string | null;
  closedAt?: string | null;
  updatedAt?: string;
  presenceTargetRatio: number;
  voteTargetRatio: number;
  optionWeights?: number[];
}) {
  const options = input.options.map((option, index) =>
    createOption(option.label, option.votes ?? 0, index),
  );

  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    sessionLabel: input.sessionLabel,
    scheduledLabel: input.scheduledLabel ?? null,
    moderatorName: input.moderatorName ?? defaultModeratorName,
    anonymous: true,
    liveResults: false,
    type: input.type,
    status: input.status,
    options,
    quorum: input.quorum,
    majorityType: input.majorityType,
    enabledUsers: input.enabledUsers,
    presentUsers: input.presentUsers,
    votesSubmitted: input.votesSubmitted,
    viewerEnabled: input.viewerEnabled,
    viewerVoteOptionId: input.viewerVoteOptionId ?? null,
    createdAt: input.createdAt,
    openedAt: input.openedAt ?? null,
    closedAt: input.closedAt ?? null,
    updatedAt: input.updatedAt ?? input.closedAt ?? input.openedAt ?? input.createdAt,
    presenceTargetRatio: input.presenceTargetRatio,
    voteTargetRatio: input.voteTargetRatio,
    optionWeights: input.optionWeights ?? createWeights(input.type, options.length),
  } satisfies VotingRecord;
}

export const seededVotings: VotingRecord[] = [
  createVotingRecord({
    id: "aprobacion-presupuesto-2027",
    title: "Aprobación del presupuesto 2027",
    summary: "Se vota el presupuesto anual propuesto por tesorería.",
    sessionLabel: "Asamblea ordinaria · 24 nov",
    type: "motion",
    status: "open",
    options: [
      { label: "A favor", votes: 52 },
      { label: "En contra", votes: 18 },
      { label: "Abstención", votes: 8 },
    ],
    quorum: 60,
    majorityType: "simple",
    enabledUsers: 120,
    presentUsers: 78,
    votesSubmitted: 78,
    viewerEnabled: true,
    createdAt: "2026-11-20T14:00:00.000Z",
    openedAt: "2026-11-24T11:30:00.000Z",
    updatedAt: "2026-11-24T11:42:00.000Z",
    presenceTargetRatio: 0.7,
    voteTargetRatio: 1,
    optionWeights: [0.67, 0.23, 0.1],
  }),
  createVotingRecord({
    id: "eleccion-diaconos",
    title: "Elección de diáconos",
    summary: "Se eligen tres diáconos para el período 2027–2028.",
    sessionLabel: "Asamblea extraordinaria · 8 dic",
    scheduledLabel: "8 de diciembre",
    type: "list",
    status: "draft",
    options: [{ label: "Ana María Suárez" }, { label: "Luis Fernández" }, { label: "Marta Silva" }],
    quorum: 60,
    majorityType: "qualified",
    enabledUsers: 120,
    presentUsers: 0,
    votesSubmitted: 0,
    viewerEnabled: true,
    createdAt: "2026-11-18T10:00:00.000Z",
    updatedAt: "2026-11-18T10:00:00.000Z",
    presenceTargetRatio: 0.8,
    voteTargetRatio: 0.9,
  }),
  createVotingRecord({
    id: "compra-terreno-lateral",
    title: "Compra del terreno lateral",
    summary: "Compra del terreno contiguo al templo para ampliar el estacionamiento.",
    sessionLabel: "Asamblea extraordinaria · 12 oct",
    type: "binary",
    status: "closed",
    options: [
      { label: "Sí", votes: 72 },
      { label: "No", votes: 32 },
    ],
    quorum: 60,
    majorityType: "qualified",
    enabledUsers: 120,
    presentUsers: 104,
    votesSubmitted: 104,
    viewerEnabled: true,
    viewerVoteOptionId: "si-1",
    createdAt: "2026-10-05T10:00:00.000Z",
    openedAt: "2026-10-12T11:30:00.000Z",
    closedAt: "2026-10-12T12:20:00.000Z",
    presenceTargetRatio: 0.87,
    voteTargetRatio: 1,
    optionWeights: [0.69, 0.31],
  }),
  createVotingRecord({
    id: "reforma-reglamento-interno",
    title: "Reforma del reglamento interno",
    summary: "Reforma del artículo 12 del reglamento interno.",
    sessionLabel: "Asamblea ordinaria · 15 sep",
    type: "binary",
    status: "closed",
    options: [
      { label: "Sí", votes: 60 },
      { label: "No", votes: 36 },
    ],
    quorum: 60,
    majorityType: "simple",
    enabledUsers: 120,
    presentUsers: 96,
    votesSubmitted: 96,
    viewerEnabled: true,
    viewerVoteOptionId: "si-1",
    createdAt: "2026-09-08T10:00:00.000Z",
    openedAt: "2026-09-15T11:30:00.000Z",
    closedAt: "2026-09-15T12:10:00.000Z",
    presenceTargetRatio: 0.8,
    voteTargetRatio: 1,
    optionWeights: [0.62, 0.38],
  }),
];

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function formatVotingDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getCreatedVoting(input: CreateVotingInput): VotingRecord {
  const title = input.title.trim();
  const options = input.options
    .map((option) => option.trim())
    .filter(Boolean)
    .map((option, index) => createOption(option, 0, index));
  const now = new Date().toISOString();
  const enabledUsers = Math.max(defaultEnabledUsers, input.quorum + 18);

  return {
    id: `${slugify(title)}-${Date.now().toString(36)}`,
    title,
    summary:
      input.description?.trim() ||
      `Nueva votación ${votingTypeLabels[input.type].toLowerCase()} preparada para apertura por moderación.`,
    sessionLabel: "Sesión por definir",
    scheduledLabel: null,
    moderatorName: defaultModeratorName,
    anonymous: input.anonymous ?? true,
    liveResults: input.liveResults ?? false,
    type: input.type,
    status: "draft",
    options,
    quorum: Math.min(input.quorum, enabledUsers),
    majorityType: input.majorityType,
    enabledUsers,
    presentUsers: 0,
    votesSubmitted: 0,
    viewerEnabled: true,
    viewerVoteOptionId: null,
    createdAt: now,
    openedAt: null,
    closedAt: null,
    updatedAt: now,
    presenceTargetRatio: 0.8,
    voteTargetRatio: 0.9,
    optionWeights: createWeights(input.type, options.length),
  };
}

export function getTotalVotes(voting: VotingRecord) {
  return voting.options.reduce((sum, option) => sum + option.votes, 0);
}

export function getVotingOutcome(voting: VotingRecord): VotingOutcome {
  const totalVotes = getTotalVotes(voting);
  const presentUsers = Math.max(voting.presentUsers, totalVotes);
  const quorumProgress =
    voting.quorum === 0 ? 100 : Math.min(100, (presentUsers / voting.quorum) * 100);
  const participationRate =
    presentUsers === 0 ? 0 : Math.min(100, (totalVotes / presentUsers) * 100);
  const sortedOptions = [...voting.options].sort((left, right) => right.votes - left.votes);
  const leadingOption = sortedOptions[0] ?? null;
  const secondOptionVotes = sortedOptions[1]?.votes ?? 0;
  const approvalVotes =
    voting.type === "list" ? (leadingOption?.votes ?? 0) : (voting.options[0]?.votes ?? 0);
  const approvalRate = totalVotes === 0 ? 0 : (approvalVotes / totalVotes) * 100;
  const quorumReached = presentUsers >= voting.quorum;

  let passed = false;
  let thresholdLabel = "Mayoría simple";

  if (voting.majorityType === "simple") {
    passed = quorumReached && approvalVotes > secondOptionVotes;
  }

  if (voting.majorityType === "absolute") {
    passed = quorumReached && approvalVotes / voting.enabledUsers >= 0.5;
    thresholdLabel = "50% del padrón habilitado";
  }

  if (voting.majorityType === "qualified") {
    passed = quorumReached && totalVotes > 0 && approvalVotes / totalVotes >= 2 / 3;
    thresholdLabel = "2/3 de los votos emitidos";
  }

  return {
    totalVotes,
    participationRate,
    quorumProgress,
    quorumReached,
    leadingOption,
    approvalRate,
    passed,
    resultLabel: passed ? "Aprobada" : "Rechazada",
    thresholdLabel,
  };
}

export function getDefaultOptionsForType(type: VotingType) {
  return defaultOptionLabelsByType[type].map((option) => option);
}
