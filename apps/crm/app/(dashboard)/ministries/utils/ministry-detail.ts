import { ministries } from "../data/ministries";
import { ministryDetailOverrides } from "../data/ministry-details";
import type { MinistryDetail } from "../types";

const DEFAULT_LEADER_SINCE = 2024;

export function getMinistryDetail(id: string): MinistryDetail | undefined {
  const summary = ministries.find((ministry) => ministry.id === id);
  if (!summary) return undefined;

  const overrides = ministryDetailOverrides[id];

  return {
    ...summary,
    about: overrides?.about ?? summary.description,
    schedule: overrides?.schedule ?? "A definir",
    ages: overrides?.ages ?? "Todas las edades",
    coLeaderName: overrides?.coLeaderName,
    leaderSince: overrides?.leaderSince ?? DEFAULT_LEADER_SINCE,
    movements: overrides?.movements ?? [],
  };
}
