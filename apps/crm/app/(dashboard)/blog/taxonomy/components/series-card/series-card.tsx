"use client";

import type { SeriesDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { useTaxonomyRequest } from "../../hooks/useTaxonomyRequest";
import type { SiteLocales } from "../../types";
import { SeriesForm } from "../series-form";
import { TaxonomyRow } from "../taxonomy-row";

const seriesCardBlogPage = {
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

const NEW_SERIES = "new";

interface SeriesCardProps {
  series: readonly SeriesDto[];
  site: SiteLocales;
  canEdit: boolean;
}

/** The series of the blog, with creation, editing and deletion. */
export function SeriesCard({ series, site, canEdit }: SeriesCardProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useTaxonomyRequest();
  const finish = () => setEditing(null);

  return (
    <BoardCard data-testid="series-card">
      <BoardCardHeader
        action={
          canEdit && editing === null ? (
            <BoardButton
              data-testid="series-new"
              onClick={() => setEditing(NEW_SERIES)}
              variant="primary"
            >
              <Plus aria-hidden="true" className={seriesCardBlogPage.icon} />
              Nueva serie
            </BoardButton>
          ) : null
        }
        subtitle="Agrupan artículos que se leen en orden, como un estudio por capítulos."
        title="Series"
      />
      {editing === NEW_SERIES ? <SeriesForm onDone={finish} series={null} site={site} /> : null}
      {series.length === 0 && editing === null ? (
        <p className={seriesCardBlogPage.empty}>Todavía no hay series.</p>
      ) : (
        <div className={seriesCardBlogPage.list}>
          {series.map((item) => {
            const translation =
              item.translations[site.defaultLocale] ?? Object.values(item.translations)[0];
            if (editing === item.id) {
              return <SeriesForm key={item.id} onDone={finish} series={item} site={site} />;
            }
            return (
              <TaxonomyRow
                canEdit={canEdit}
                deleteDescription="Los artículos que la usan dejarán de mostrarla."
                deleteTitle="¿Eliminar esta serie?"
                detail={translation?.slug ?? ""}
                disabled={busy}
                key={item.id}
                name={translation?.name ?? "Sin nombre"}
                onDelete={() =>
                  void run(
                    () => apiClient.content.series[":id"].$delete({ param: { id: item.id } }),
                    "Serie eliminada",
                  )
                }
                onEdit={() => setEditing(item.id)}
                testId={`series-row-${translation?.slug ?? item.id}`}
              />
            );
          })}
        </div>
      )}
    </BoardCard>
  );
}
