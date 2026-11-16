import { getChurchRoutePath } from "@/lib/church";

export function getVotingListPath() {
  return getChurchRoutePath("voting");
}

export function getVotingCreatePath() {
  return getChurchRoutePath("voting", "create");
}

export function getVotingDetailPath(votingId: string) {
  return getChurchRoutePath("voting", votingId);
}

export function getVotingModeratorPath(votingId: string) {
  return getChurchRoutePath("voting", votingId, "moderator");
}

export function getVotingVotePath(votingId: string) {
  return getChurchRoutePath("voting", votingId, "vote");
}

export function getVotingResultsPath(votingId: string) {
  return getChurchRoutePath("voting", votingId, "results");
}
