"use client";

import type { MinistryListItemDto } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { apiClient } from "@/lib/api/apiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useMinistryRequest } from "../../../hooks/useMinistryRequest";
import type { LandingRowValues } from "../../types";
import {
  findRowsMissingPhoto,
  moveLandingRow,
  toLandingBody,
  toLandingRows,
} from "../../utils/landingRows";
import { LandingRow } from "../landing-row";

const landingPageContentMinistriesPage = {
  container: cn("flex flex-col gap-[18px]"),
  list: cn("flex flex-col gap-3"),
  footer: cn("mt-4 flex flex-wrap justify-end gap-2.5"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

interface LandingPageContentProps {
  ministries: readonly MinistryListItemDto[];
}

/** The mosaic of the landing: order, visibility and tile of every ministry, saved all at once. */
export function LandingPageContent({ ministries }: LandingPageContentProps) {
  const [rows, setRows] = useState<LandingRowValues[]>(() => toLandingRows(ministries));
  const { busy, run } = useMinistryRequest();

  const patchRow = (id: string, patch: Partial<LandingRowValues>) =>
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  async function submit(): Promise<void> {
    const missing = findRowsMissingPhoto(rows);
    if (missing.length > 0) {
      toast.error(`Falta la foto de: ${missing.map((row) => row.name).join(", ")}.`);
      return;
    }
    await run(
      () => apiClient.content.ministries.landing.$patch({ json: toLandingBody(rows) }),
      "Mosaico guardado",
    );
  }

  return (
    <div className={landingPageContentMinistriesPage.container}>
      <BoardCard>
        <BoardCardHeader
          subtitle="Ordena los ministerios del mosaico de la página de inicio. Cada ficha es un color o una foto."
          title="Mosaico de la landing"
        />
        {rows.length === 0 ? (
          <p className={landingPageContentMinistriesPage.empty}>Todavía no hay ministerios.</p>
        ) : (
          <div className={landingPageContentMinistriesPage.list} data-testid="landing-list">
            {rows.map((row, index) => (
              <LandingRow
                key={row.id}
                onChange={(patch) => patchRow(row.id, patch)}
                onMove={(direction) =>
                  setRows((previous) => moveLandingRow(previous, index, direction))
                }
                position={index + 1}
                row={row}
              />
            ))}
          </div>
        )}
        <div className={landingPageContentMinistriesPage.footer}>
          <BoardButton href={getChurchRoutePath("ministries")} variant="ghost">
            Volver
          </BoardButton>
          <BoardButton
            data-testid="landing-save"
            disabled={busy || rows.length === 0}
            onClick={() => void submit()}
            variant="primary"
          >
            {busy ? "Guardando…" : "Guardar mosaico"}
          </BoardButton>
        </div>
      </BoardCard>
    </div>
  );
}
