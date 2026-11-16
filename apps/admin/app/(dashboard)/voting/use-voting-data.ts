"use client";

import { useEffect, useState } from "react";
import type { CreateVotingInput, VotingStatus } from "./types";
import { seededVotings } from "./voting-config";
import {
  advanceVotingSimulation,
  createVotingRecord,
  readVotings,
  setVotingStatus,
  submitViewerVote,
  votingStoreEventName,
  writeVotings,
} from "./voting-store";

interface UseVotingCollectionOptions {
  live?: boolean;
  intervalMs?: number;
}

const defaultOptions = {
  live: false,
  intervalMs: 2400,
} satisfies UseVotingCollectionOptions;

export function useVotingCollection(options: UseVotingCollectionOptions = defaultOptions) {
  const { live = false, intervalMs = 2400 } = options;
  const [votings, setVotings] = useState(() => seededVotings);

  const commit = (
    updater: (current: ReturnType<typeof readVotings>) => ReturnType<typeof readVotings>,
  ) => {
    const nextVotings = updater(readVotings());
    writeVotings(nextVotings);
    setVotings(nextVotings);
  };

  useEffect(() => {
    setVotings(readVotings());
  }, []);

  useEffect(() => {
    const handleSync = () => {
      setVotings(readVotings());
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(votingStoreEventName, handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(votingStoreEventName, handleSync);
    };
  }, []);

  useEffect(() => {
    if (!live) {
      return;
    }

    const intervalId = window.setInterval(() => {
      commit((current) => advanceVotingSimulation(current));
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [intervalMs, live]);

  return {
    votings,
    createVoting: (input: CreateVotingInput) => {
      let createdVotingId = "";

      commit((current) => {
        const nextVotings = createVotingRecord(current, input);
        createdVotingId = nextVotings[0]?.id ?? "";
        return nextVotings;
      });

      return createdVotingId;
    },
    updateVotingStatus: (votingId: string, status: VotingStatus) => {
      commit((current) => setVotingStatus(current, votingId, status));
    },
    castViewerVote: (votingId: string, optionId: string) => {
      commit((current) => submitViewerVote(current, votingId, optionId));
    },
  };
}
