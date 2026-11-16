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
    id: "ampliacion-salon-comunitario",
    title: "Aprobación de ampliación del salón comunitario",
    summary:
      "Moción abierta en la asamblea extraordinaria con participación activa y quorum cumplido.",
    type: "motion",
    status: "open",
    options: [
      { label: "A favor", votes: 34 },
      { label: "En contra", votes: 16 },
      { label: "Abstención", votes: 7 },
    ],
    quorum: 80,
    majorityType: "simple",
    enabledUsers: 132,
    presentUsers: 91,
    votesSubmitted: 57,
    viewerEnabled: true,
    createdAt: "2026-03-28T18:40:00.000Z",
    openedAt: "2026-03-29T00:12:00.000Z",
    updatedAt: "2026-03-29T00:12:00.000Z",
    presenceTargetRatio: 0.84,
    voteTargetRatio: 0.9,
    optionWeights: [0.56, 0.29, 0.15],
  }),
  createVotingRecord({
    id: "delegados-convencion-juvenil",
    title: "Elección de delegados para la convención juvenil",
    summary:
      "Lista abierta para seleccionar una terna; esta vista permite probar el estado no habilitado.",
    type: "list",
    status: "open",
    options: [
      { label: "Ana María Suárez", votes: 11 },
      { label: "Luis Fernández", votes: 10 },
      { label: "Marta Silva", votes: 6 },
    ],
    quorum: 40,
    majorityType: "simple",
    enabledUsers: 74,
    presentUsers: 44,
    votesSubmitted: 27,
    viewerEnabled: false,
    createdAt: "2026-03-28T19:05:00.000Z",
    openedAt: "2026-03-29T00:16:00.000Z",
    updatedAt: "2026-03-29T00:16:00.000Z",
    presenceTargetRatio: 0.78,
    voteTargetRatio: 0.82,
    optionWeights: [0.4, 0.34, 0.26],
  }),
  createVotingRecord({
    id: "reforma-reglamento-interno",
    title: "Reforma del reglamento interno, artículo 12",
    summary: "Votación cerrada con mayoría calificada alcanzada y acta lista para lectura final.",
    type: "binary",
    status: "closed",
    options: [
      { label: "Sí", votes: 78 },
      { label: "No", votes: 31 },
    ],
    quorum: 85,
    majorityType: "qualified",
    enabledUsers: 128,
    presentUsers: 109,
    votesSubmitted: 109,
    viewerEnabled: true,
    viewerVoteOptionId: "si-1",
    createdAt: "2026-03-27T22:30:00.000Z",
    openedAt: "2026-03-28T23:10:00.000Z",
    closedAt: "2026-03-29T00:02:00.000Z",
    updatedAt: "2026-03-29T00:02:00.000Z",
    presenceTargetRatio: 0.86,
    voteTargetRatio: 1,
    optionWeights: [0.72, 0.28],
  }),
  createVotingRecord({
    id: "presupuesto-obras-2026",
    title: "Presupuesto de obras 2026",
    summary: "Borrador listo para revisión del moderador antes de abrir el proceso a la asamblea.",
    type: "motion",
    status: "draft",
    options: [
      { label: "A favor", votes: 0 },
      { label: "En contra", votes: 0 },
      { label: "Abstención", votes: 0 },
    ],
    quorum: 90,
    majorityType: "absolute",
    enabledUsers: 130,
    presentUsers: 0,
    votesSubmitted: 0,
    viewerEnabled: true,
    createdAt: "2026-03-29T00:20:00.000Z",
    updatedAt: "2026-03-29T00:20:00.000Z",
    presenceTargetRatio: 0.82,
    voteTargetRatio: 0.88,
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
    summary: `Nueva votación ${votingTypeLabels[input.type].toLowerCase()} preparada para apertura por moderación.`,
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
