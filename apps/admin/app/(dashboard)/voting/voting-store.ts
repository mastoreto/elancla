import type { VotingRecord, VotingStatus } from "./types";
import { getCreatedVoting, getTotalVotes, seededVotings } from "./voting-config";

const votingStorageKey = "iekklesia-voting-store";
export const votingStoreEventName = "iekklesia:voting-store-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneVotings(votings: VotingRecord[]) {
  return votings.map((voting) => ({
    ...voting,
    options: voting.options.map((option) => ({ ...option })),
    optionWeights: [...voting.optionWeights],
  }));
}

function sanitizeVoting(voting: VotingRecord): VotingRecord {
  const totalVotes = getTotalVotes(voting);
  const trimmedTitle = voting.title.trim();
  const options =
    voting.options.length === 0
      ? getCreatedVoting({
          title: trimmedTitle || "Nueva votación",
          type: voting.type,
          options: ["Sí", "No"],
          quorum: voting.quorum,
          majorityType: voting.majorityType,
        }).options
      : voting.options.map((option, index) => ({
          ...option,
          id: option.id || `${voting.id}-option-${index + 1}`,
          label: option.label.trim() || `Opción ${index + 1}`,
          votes: Math.max(0, option.votes),
        }));

  return {
    ...voting,
    title: trimmedTitle || "Nueva votación",
    summary: voting.summary.trim() || "Sin resumen operativo cargado.",
    options,
    quorum: Math.max(1, voting.quorum),
    enabledUsers: Math.max(voting.enabledUsers, voting.quorum),
    presentUsers: Math.max(voting.presentUsers, totalVotes),
    votesSubmitted: Math.max(voting.votesSubmitted, totalVotes),
    optionWeights:
      voting.optionWeights.length === options.length
        ? voting.optionWeights
        : Array.from({ length: options.length }, () => 1),
  };
}

function dispatchVotingStoreEvent() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(votingStoreEventName));
}

export function readVotings() {
  if (!isBrowser()) {
    return cloneVotings(seededVotings);
  }

  const stored = window.localStorage.getItem(votingStorageKey);

  if (!stored) {
    return cloneVotings(seededVotings);
  }

  try {
    const parsed = JSON.parse(stored) as VotingRecord[];
    return cloneVotings(parsed.map(sanitizeVoting));
  } catch {
    return cloneVotings(seededVotings);
  }
}

export function writeVotings(votings: VotingRecord[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(votingStorageKey, JSON.stringify(votings));
  dispatchVotingStoreEvent();
}

export function createVotingRecord(
  votings: VotingRecord[],
  input: Parameters<typeof getCreatedVoting>[0],
) {
  return [getCreatedVoting(input), ...cloneVotings(votings)];
}

function updateVoting(
  votings: VotingRecord[],
  votingId: string,
  transform: (voting: VotingRecord) => VotingRecord,
) {
  return votings.map((voting) =>
    voting.id === votingId ? sanitizeVoting(transform(voting)) : voting,
  );
}

export function setVotingStatus(votings: VotingRecord[], votingId: string, status: VotingStatus) {
  const now = new Date().toISOString();

  return updateVoting(votings, votingId, (voting) => {
    if (voting.status === status) {
      return voting;
    }

    if (status === "open") {
      return {
        ...voting,
        status,
        openedAt: voting.openedAt ?? now,
        closedAt: null,
        updatedAt: now,
      };
    }

    if (status === "closed") {
      return {
        ...voting,
        status,
        closedAt: now,
        updatedAt: now,
      };
    }

    return {
      ...voting,
      status,
      openedAt: null,
      closedAt: null,
      updatedAt: now,
      presentUsers: 0,
      votesSubmitted: 0,
      options: voting.options.map((option) => ({ ...option, votes: 0 })),
      viewerVoteOptionId: null,
    };
  });
}

export function submitViewerVote(votings: VotingRecord[], votingId: string, optionId: string) {
  const now = new Date().toISOString();

  return updateVoting(votings, votingId, (voting) => {
    if (voting.status !== "open" || !voting.viewerEnabled || voting.viewerVoteOptionId) {
      return voting;
    }

    const nextOptions = voting.options.map((option) =>
      option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
    );
    const totalVotes = nextOptions.reduce((sum, option) => sum + option.votes, 0);

    return {
      ...voting,
      options: nextOptions,
      viewerVoteOptionId: optionId,
      presentUsers: Math.max(voting.presentUsers, totalVotes),
      votesSubmitted: Math.max(voting.votesSubmitted + 1, totalVotes),
      updatedAt: now,
    };
  });
}

function getWeightedOptionIndex(weights: number[]) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const roll = Math.random() * totalWeight;
  let cursor = 0;

  for (const [index, weight] of weights.entries()) {
    cursor += weight;

    if (roll <= cursor) {
      return index;
    }
  }

  return weights.length - 1;
}

function advanceSingleVoting(voting: VotingRecord) {
  if (voting.status !== "open") {
    return voting;
  }

  const totalVotes = getTotalVotes(voting);
  const targetPresent = Math.min(
    voting.enabledUsers,
    Math.max(voting.quorum + 4, Math.round(voting.enabledUsers * voting.presenceTargetRatio)),
  );
  const targetVotes = Math.min(targetPresent, Math.round(targetPresent * voting.voteTargetRatio));
  const presentIncrement =
    voting.presentUsers < targetPresent ? Math.max(1, Math.round(Math.random() * 2)) : 0;
  const nextPresentUsers = Math.min(targetPresent, voting.presentUsers + presentIncrement);
  const availableVotes = Math.max(0, targetVotes - totalVotes);
  const voteIncrement =
    availableVotes === 0 ? 0 : Math.min(availableVotes, Math.max(1, Math.round(Math.random() * 2)));

  if (presentIncrement === 0 && voteIncrement === 0) {
    return voting;
  }

  const nextOptions = voting.options.map((option) => ({ ...option }));

  for (let index = 0; index < voteIncrement; index += 1) {
    const optionIndex = getWeightedOptionIndex(voting.optionWeights);
    const selectedOption = nextOptions[optionIndex];

    if (!selectedOption) {
      continue;
    }

    selectedOption.votes += 1;
  }

  const updatedVotes = nextOptions.reduce((sum, option) => sum + option.votes, 0);

  return {
    ...voting,
    options: nextOptions,
    presentUsers: Math.max(nextPresentUsers, updatedVotes),
    votesSubmitted: Math.max(voting.votesSubmitted, updatedVotes),
    updatedAt: new Date().toISOString(),
  };
}

export function advanceVotingSimulation(votings: VotingRecord[]) {
  return votings.map(advanceSingleVoting);
}
