"use client";

import {
  SITE_SECTION_KEYS,
  SITE_SECTION_STATUSES,
  type SiteSectionKey,
  type SiteSectionStatus,
  type SiteSettingsDto,
} from "@ancla/contracts";
import { useState } from "react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardSelect } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";
import { CardSaveFooter } from "../card-save-footer";

const sectionsCardWebsitePage = {
  grid: cn("grid gap-3.5 md:grid-cols-2 xl:grid-cols-3"),
};

const SECTION_LABELS: Record<SiteSectionKey, string> = {
  blog: "Blog",
  calendar: "Calendario",
  sermons: "Sermones",
  ministries: "Ministerios",
  visit: "Visítanos",
};

const STATUS_LABELS: Record<SiteSectionStatus, string> = {
  active: "Activa",
  maintenance: "Mantenimiento",
  outOfService: "Fuera de servicio",
};

const STATUS_OPTIONS = SITE_SECTION_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

function isSectionStatus(value: string): value is SiteSectionStatus {
  return SITE_SECTION_STATUSES.some((status) => status === value);
}

type SectionsSettings = Pick<SiteSettingsDto, "sections" | "version">;

interface SectionsCardProps {
  settings: SectionsSettings;
}

export function SectionsCard({ settings }: SectionsCardProps) {
  const [sections, setSections] = useState(settings.sections);
  const { canEdit, saving, save } = useSaveSiteSettings(settings.version);

  const submit = () => save({ sections }, "Secciones actualizadas");

  return (
    <BoardCard>
      <BoardCardHeader
        subtitle="En mantenimiento se muestra un aviso; fuera de servicio desaparece del sitio"
        title="Secciones del sitio"
      />
      <div className={sectionsCardWebsitePage.grid}>
        {SITE_SECTION_KEYS.map((key) => (
          <BoardSelect
            disabled={!canEdit}
            id={`section-${key}`}
            key={key}
            label={SECTION_LABELS[key]}
            onValueChange={(value) =>
              isSectionStatus(value) && setSections((previous) => ({ ...previous, [key]: value }))
            }
            options={STATUS_OPTIONS}
            value={sections[key]}
          />
        ))}
      </div>
      <CardSaveFooter canEdit={canEdit} onSave={() => void submit()} saving={saving} />
    </BoardCard>
  );
}
