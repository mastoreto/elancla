import { BarChart3, Heart, LayoutGrid } from "lucide-react";
import type { IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import type { ReportKind } from "../types";

export const REPORT_KIND_TONE = {
  SUMMARY: "rose",
  COMPARISON: "gold",
  DISTRIBUTION: "green",
  DETAIL: "gold",
} as const satisfies Record<ReportKind, IconBubbleTone>;

const ICONS = {
  SUMMARY: LayoutGrid,
  COMPARISON: BarChart3,
  DISTRIBUTION: Heart,
  DETAIL: BarChart3,
} as const satisfies Record<ReportKind, typeof BarChart3>;

export function ReportKindIcon({ kind, className }: { kind: ReportKind; className?: string }) {
  const Icon = ICONS[kind];
  return <Icon aria-hidden="true" className={className} />;
}
