export interface VotingParticipant {
  id: string;
  name: string;
  initials: string;
  /** Clock time of the vote, or null while still pending. */
  votedAt: string | null;
}

// Seed attendance list from the "crm-s-votacion-moderacion" board.
export const votingParticipants: VotingParticipant[] = [
  { id: "lucia-perez", name: "Lucía Pérez", initials: "LP", votedAt: "11:34" },
  { id: "martin-silva", name: "Martín Silva", initials: "MS", votedAt: "11:35" },
  { id: "juan-gomez", name: "Juan Gómez", initials: "JG", votedAt: null },
  { id: "ana-martinez", name: "Ana Martínez", initials: "AM", votedAt: "11:36" },
  { id: "diego-fernandez", name: "Diego Fernández", initials: "DF", votedAt: null },
];
