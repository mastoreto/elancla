"use client";

import { Globe, Lock, Sun } from "lucide-react";
import { useState } from "react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { IconBubble, type IconBubbleTone } from "@/components/dashboard/board/icon-bubble";
import { StatusPill, type StatusPillTone } from "@/components/dashboard/board/status-pill";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";

type SiteStatus = "online" | "maintenance" | "closed";

const siteStatusCardWebsitePage = {
  options: cn("grid gap-3.5 md:grid-cols-3"),
  option: cn(
    "flex flex-col items-start gap-2.5 rounded-[26px] bg-card p-[18px] text-left transition",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] hover:-translate-y-px disabled:opacity-60",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  ),
  bubble: cn("size-[42px]"),
  icon: cn("size-5"),
  label: cn("font-display text-[19px] font-medium"),
  hint: cn("text-[13px] leading-normal text-[var(--tinta-suave)]"),
};

const STATUS_OPTIONS: {
  value: SiteStatus;
  label: string;
  description: string;
  icon: typeof Globe;
  bubble: IconBubbleTone;
  pill: StatusPillTone;
  selected: string;
}[] = [
  {
    value: "online",
    label: "En línea",
    description: "El sitio web es visible y accesible para todos.",
    icon: Globe,
    bubble: "green",
    pill: "green",
    selected: cn("bg-[var(--vida-50)] shadow-[inset_0_0_0_2px_var(--vida)]"),
  },
  {
    value: "maintenance",
    label: "Mantenimiento",
    description: "Se muestra una página de mantenimiento a los visitantes.",
    icon: Sun,
    bubble: "gold",
    pill: "gold",
    selected: cn("bg-[var(--oro-50)] shadow-[inset_0_0_0_2px_var(--oro)]"),
  },
  {
    value: "closed",
    label: "Cerrado",
    description: "El sitio está inaccesible. Solo los administradores pueden verlo.",
    icon: Lock,
    bubble: "rose",
    pill: "rose",
    selected: cn("bg-[var(--granada-50)] shadow-[inset_0_0_0_2px_var(--primary)]"),
  },
];

interface SiteStatusCardProps {
  initialStatus: SiteStatus;
  version: number;
}

export function SiteStatusCard({ initialStatus, version }: SiteStatusCardProps) {
  const [status, setStatus] = useState<SiteStatus>(initialStatus);
  const { canEdit, saving, save } = useSaveSiteSettings(version);
  const current = STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0];

  async function select(next: SiteStatus): Promise<void> {
    if (next === status) return;
    const previous = status;
    setStatus(next);
    const saved = await save({ status: next }, "Estado del sitio actualizado");
    if (!saved) setStatus(previous);
  }

  return (
    <BoardCard>
      <BoardCardHeader
        action={<StatusPill tone={current.pill}>{current.label}</StatusPill>}
        subtitle="Controla la visibilidad pública del sitio web de la iglesia"
        title="Estado del sitio"
      />
      <div className={siteStatusCardWebsitePage.options}>
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === status;
          return (
            <button
              aria-pressed={isSelected}
              className={cn(siteStatusCardWebsitePage.option, isSelected && option.selected)}
              disabled={saving || !canEdit}
              key={option.value}
              onClick={() => void select(option.value)}
              type="button"
            >
              <IconBubble className={siteStatusCardWebsitePage.bubble} tone={option.bubble}>
                <Icon aria-hidden="true" className={siteStatusCardWebsitePage.icon} />
              </IconBubble>
              <b className={siteStatusCardWebsitePage.label}>{option.label}</b>
              <span className={siteStatusCardWebsitePage.hint}>{option.description}</span>
            </button>
          );
        })}
      </div>
    </BoardCard>
  );
}
