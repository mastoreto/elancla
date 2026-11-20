"use client";

import type { CategoryDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { apiClient } from "@/lib/api/apiClient";
import { cn } from "@/lib/utils";
import { useTaxonomyRequest } from "../../hooks/useTaxonomyRequest";
import type { SiteLocales } from "../../types";
import { CategoryForm } from "../category-form";
import { TaxonomyRow } from "../taxonomy-row";

const categoryCardBlogPage = {
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

const NEW_CATEGORY = "new";

interface CategoryCardProps {
  categories: readonly CategoryDto[];
  site: SiteLocales;
  canEdit: boolean;
}

function nextOrderAfter(categories: readonly CategoryDto[]): number {
  return categories.reduce((highest, category) => Math.max(highest, category.order + 1), 0);
}

/** The categories of the blog, with creation, editing and deletion. */
export function CategoryCard({ categories, site, canEdit }: CategoryCardProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useTaxonomyRequest();
  const finish = () => setEditing(null);

  return (
    <BoardCard data-testid="categories-card">
      <BoardCardHeader
        action={
          canEdit && editing === null ? (
            <BoardButton
              data-testid="category-new"
              onClick={() => setEditing(NEW_CATEGORY)}
              variant="primary"
            >
              <Plus aria-hidden="true" className={categoryCardBlogPage.icon} />
              Nueva categoría
            </BoardButton>
          ) : null
        }
        subtitle="Agrupan los artículos del blog. Una categoría con artículos publicados no se puede borrar."
        title="Categorías"
      />
      {editing === NEW_CATEGORY ? (
        <CategoryForm
          category={null}
          nextOrder={nextOrderAfter(categories)}
          onDone={finish}
          site={site}
        />
      ) : null}
      {categories.length === 0 && editing === null ? (
        <p className={categoryCardBlogPage.empty}>Todavía no hay categorías.</p>
      ) : (
        <div className={categoryCardBlogPage.list}>
          {categories.map((category) => {
            const translation =
              category.translations[site.defaultLocale] ?? Object.values(category.translations)[0];
            if (editing === category.id) {
              return (
                <CategoryForm
                  category={category}
                  key={category.id}
                  nextOrder={0}
                  onDone={finish}
                  site={site}
                />
              );
            }
            return (
              <TaxonomyRow
                canEdit={canEdit}
                deleteDescription="Dejará de estar disponible para nuevos artículos."
                deleteTitle="¿Eliminar esta categoría?"
                detail={`${translation?.slug ?? ""} · orden ${category.order}`}
                disabled={busy}
                key={category.id}
                name={translation?.name ?? "Sin nombre"}
                onDelete={() =>
                  void run(
                    () =>
                      apiClient.content.categories[":id"].$delete({ param: { id: category.id } }),
                    "Categoría eliminada",
                  )
                }
                onEdit={() => setEditing(category.id)}
                testId={`category-row-${translation?.slug ?? category.id}`}
              />
            );
          })}
        </div>
      )}
    </BoardCard>
  );
}
