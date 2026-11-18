import { StatusPill, type StatusPillTone } from "@/components/dashboard/board/status-pill";

const STATUS = {
  published: { label: "Publicado", tone: "green" },
  draft: { label: "Borrador", tone: "gold" },
  paused: { label: "Pausado", tone: "ink" },
} as const satisfies Record<string, { label: string; tone: StatusPillTone }>;

export type ContentStatus = keyof typeof STATUS;

export function ContentStatusPill({ status }: { status: ContentStatus }) {
  return <StatusPill tone={STATUS[status].tone}>{STATUS[status].label}</StatusPill>;
}
