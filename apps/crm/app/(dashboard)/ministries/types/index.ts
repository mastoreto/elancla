export type MinistryCategory = "Por edades" | "Cultos y Palabra" | "Servicio";

export interface MinistrySummary {
  id: string;
  name: string;
  category: MinistryCategory;
  description: string;
  volunteers: number;
  leaderName: string;
  currency: "$U" | "$";
  executed: number;
  budget: number;
  visibleOnSite: boolean;
}

export interface MinistryMovement {
  id: string;
  /** ISO date of the movement. */
  date: string;
  concept: string;
  project: string;
  /** Negative for expenses, positive for income. */
  amount: number;
}

export interface MinistryDetail extends MinistrySummary {
  about: string;
  schedule: string;
  ages: string;
  coLeaderName: string | undefined;
  leaderSince: number;
  movements: MinistryMovement[];
}

export interface MinistryFormValues {
  name: string;
  description: string;
  category: MinistryCategory | "";
  ages: string;
  howToJoin: string;
  leaderName: string;
  coLeaderName: string;
  schedule: string;
  location: string;
  budget: string;
  currency: MinistrySummary["currency"];
  visibleOnSite: boolean;
}

export type MinistryViewMode = "cards" | "table";

export type MinistryScope = "all" | "withLeader" | "noBudget";

export interface MinistryFilters {
  search: string;
  scope: MinistryScope;
}
