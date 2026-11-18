import { Globe, Heart, Mic, Star, Users } from "lucide-react";
import type { IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import type { MinistryFilters, MinistrySummary } from "../types";

export const DEFAULT_MINISTRY_FILTERS: MinistryFilters = { search: "", scope: "all" };

/** Icon and bubble tone per ministry, as the board draws them. */
const MINISTRY_APPEARANCE: Record<string, { icon: typeof Heart; tone: IconBubbleTone }> = {
  jovenes: { icon: Heart, tone: "rose" },
  adoracion: { icon: Mic, tone: "gold" },
  misiones: { icon: Globe, tone: "green" },
  alcance: { icon: Users, tone: "rose" },
  ninos: { icon: Star, tone: "gold" },
};

const FALLBACK_APPEARANCE = { icon: Heart, tone: "rose" } as const;

export function getMinistryAppearance(id: string): { icon: typeof Heart; tone: IconBubbleTone } {
  return MINISTRY_APPEARANCE[id] ?? FALLBACK_APPEARANCE;
}

/** Executed share bar goes green while the ministry is far from its budget. */
export function getExecutionTone(percent: number): "green" | "gold" {
  return percent < 50 ? "green" : "gold";
}

export function filterMinistries(
  ministries: readonly MinistrySummary[],
  { search, scope }: MinistryFilters,
): MinistrySummary[] {
  const query = search.trim().toLowerCase();

  return ministries.filter((ministry) => {
    if (scope === "withLeader" && ministry.leaderName.trim() === "") {
      return false;
    }
    if (scope === "noBudget" && ministry.budget > 0) {
      return false;
    }
    return (
      query === "" ||
      ministry.name.toLowerCase().includes(query) ||
      ministry.leaderName.toLowerCase().includes(query)
    );
  });
}

export interface MinistriesTotals {
  count: number;
  volunteers: number;
  /** Local-currency (pesos) budget and spend; dollar budgets are summed apart. */
  pesosBudget: number;
  pesosExecuted: number;
  dollarsBudget: number;
}

export function summarizeMinistries(ministries: readonly MinistrySummary[]): MinistriesTotals {
  return ministries.reduce<MinistriesTotals>(
    (totals, ministry) => ({
      count: totals.count + 1,
      volunteers: totals.volunteers + ministry.volunteers,
      pesosBudget: totals.pesosBudget + (ministry.currency === "$U" ? ministry.budget : 0),
      pesosExecuted: totals.pesosExecuted + (ministry.currency === "$U" ? ministry.executed : 0),
      dollarsBudget: totals.dollarsBudget + (ministry.currency === "$" ? ministry.budget : 0),
    }),
    { count: 0, volunteers: 0, pesosBudget: 0, pesosExecuted: 0, dollarsBudget: 0 },
  );
}
