"use client";

import { LANDING_TONES, type LandingTile, type LandingTone } from "@ancla/contracts";
import { ArrowDown, ArrowUp, Image as ImageIcon, Palette } from "lucide-react";
import { BoardSelect, BoardSwitchRow } from "@/components/dashboard/board/board-form";
import { RowIconButton } from "@/components/dashboard/board/row-icon-button";
import {
  type SegmentedOption,
  SegmentedToggle,
} from "@/components/dashboard/board/segmented-toggle";
import { cn } from "@/lib/utils";
import { MinistryImageField } from "../../../components/ministry-image-field";
import { TONE_LABELS } from "../../../data/ministryLabels";
import type { LandingRowValues, MoveDirection } from "../../types";

const TILE_OPTIONS: SegmentedOption<LandingTile>[] = [
  { value: "color", label: "Color", icon: Palette },
  { value: "photo", label: "Foto", icon: ImageIcon },
];
const TONE_OPTIONS = LANDING_TONES.map((tone) => ({ value: tone, label: TONE_LABELS[tone] }));

const landingRowMinistriesPage = {
  container: cn("flex flex-col gap-3 rounded-[20px] bg-[var(--oro-50)] p-3.5"),
  header: cn("flex items-center gap-3"),
  position: cn("w-6 text-center text-sm font-bold text-[var(--tinta-apagada)]"),
  name: cn("min-w-0 flex-1 truncate text-[15px] font-bold"),
  muted: cn("text-[var(--tinta-apagada)]"),
  controls: cn("flex flex-wrap items-end gap-3"),
  tone: cn("min-w-40"),
  icon: cn("size-4"),
};

interface LandingRowProps {
  row: LandingRowValues;
  /** 1-based position in the list. */
  position: number;
  onChange: (patch: Partial<LandingRowValues>) => void;
  onMove: (direction: MoveDirection) => void;
}

/** One ministry of the mosaic: its place in the list, whether it shows and its tile. */
export function LandingRow({ row, position, onChange, onMove }: LandingRowProps) {
  return (
    <div className={landingRowMinistriesPage.container} data-testid={`landing-row-${row.id}`}>
      <div className={landingRowMinistriesPage.header}>
        <span aria-hidden="true" className={landingRowMinistriesPage.position}>
          {position}
        </span>
        <span
          className={cn(
            landingRowMinistriesPage.name,
            !row.showOnLanding && landingRowMinistriesPage.muted,
          )}
        >
          {row.name}
        </span>
        <RowIconButton label={`Subir ${row.name}`} onClick={() => onMove("up")}>
          <ArrowUp aria-hidden="true" className={landingRowMinistriesPage.icon} />
        </RowIconButton>
        <RowIconButton label={`Bajar ${row.name}`} onClick={() => onMove("down")}>
          <ArrowDown aria-hidden="true" className={landingRowMinistriesPage.icon} />
        </RowIconButton>
      </div>
      <BoardSwitchRow
        checked={row.showOnLanding}
        hint="Solo entra al mosaico si su perfil está publicado."
        onCheckedChange={(showOnLanding) => onChange({ showOnLanding })}
        title="Mostrar en la landing"
      />
      <div className={landingRowMinistriesPage.controls}>
        <SegmentedToggle
          label={`Tipo de ficha de ${row.name}`}
          onValueChange={(landingTile) => onChange({ landingTile })}
          options={TILE_OPTIONS}
          value={row.landingTile}
        />
        {row.landingTile === "color" ? (
          <div className={landingRowMinistriesPage.tone}>
            <BoardSelect
              id={`landing-tone-${row.id}`}
              label="Tono"
              onValueChange={(tone) => onChange({ landingTone: tone as LandingTone })}
              options={TONE_OPTIONS}
              value={row.landingTone}
            />
          </div>
        ) : null}
      </div>
      {row.landingTile === "photo" ? (
        <MinistryImageField
          disabled={false}
          hint="JPG, PNG, WebP o AVIF"
          id={`landing-photo-${row.id}`}
          label="Foto de la ficha"
          mediaId={row.landingPhotoId}
          onChange={(landingPhotoId) => onChange({ landingPhotoId })}
          title="Arrastra la foto"
        />
      ) : null}
    </div>
  );
}
