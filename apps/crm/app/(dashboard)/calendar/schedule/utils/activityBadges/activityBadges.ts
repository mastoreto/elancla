import type { RecurringActivityDto, ServiceKind } from "@ancla/contracts";
import type { StatusPillTone } from "@/components/dashboard/board/status-pill";

export interface ActivityBadge {
  label: string;
  tone: StatusPillTone;
}

const SERVICE_KIND_LABELS = {
  worship: "Culto",
  bibleSchool: "Escuela bíblica",
} satisfies Record<ServiceKind, string>;

/** The pills of an activity row: what it is, who sees it, how long it lasts and what is pending. */
export function describeActivityBadges(activity: RecurringActivityDto): ActivityBadge[] {
  const badges: ActivityBadge[] = [];
  if (activity.serviceKind !== null) {
    badges.push({ label: SERVICE_KIND_LABELS[activity.serviceKind], tone: "rose" });
  }
  badges.push(
    activity.isPublic ? { label: "Pública", tone: "green" } : { label: "Interna", tone: "ink" },
  );
  badges.push({
    label: activity.year === null ? "Fija" : `Año ${activity.year}`,
    tone: "ink",
  });
  if (activity.annualReview) badges.push({ label: "Revisión anual", tone: "gold" });
  if (activity.needsReview) badges.push({ label: "A revisar", tone: "gold" });
  return badges;
}
