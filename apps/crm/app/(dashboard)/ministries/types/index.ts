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
