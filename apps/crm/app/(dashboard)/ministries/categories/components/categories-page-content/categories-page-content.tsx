"use client";

import type { MinistryCategoryDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { apiClient } from "@/lib/api/apiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useMinistryRequest } from "../../../hooks/useMinistryRequest";
import { pickLocalized } from "../../../utils/pickLocalized";
import type { CategoriesData } from "../../types";
import { CategoryForm } from "../category-form";
import { CategoryRow } from "../category-row";

const categoriesPageContentMinistriesPage = {
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  actions: cn("flex gap-2"),
  icon: cn("size-4"),
};

const NEW_CATEGORY = "new";

function nextOrderAfter(categories: readonly MinistryCategoryDto[]): number {
  return categories.reduce((highest, category) => Math.max(highest, category.order + 1), 0);
}

/** The categories of the ministries, with creation, editing and deletion. */
export function CategoriesPageContent({ categories, site }: CategoriesData) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useMinistryRequest();
  const finish = () => setEditing(null);

  return (
    <BoardCard data-testid="ministry-categories-card">
      <BoardCardHeader
        action={
          <div className={categoriesPageContentMinistriesPage.actions}>
            <BoardButton href={getChurchRoutePath("ministries")} variant="ghost">
              Volver
            </BoardButton>
            {editing === null ? (
              <BoardButton
                data-testid="ministry-category-new"
                onClick={() => setEditing(NEW_CATEGORY)}
                variant="primary"
              >
                <Plus aria-hidden="true" className={categoriesPageContentMinistriesPage.icon} />
                Nueva categoría
              </BoardButton>
            ) : null}
          </div>
        }
        subtitle="Agrupan los ministerios. Una categoría que algún ministerio usa no se puede borrar."
        title="Categorías de ministerios"
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
        <p className={categoriesPageContentMinistriesPage.empty}>Todavía no hay categorías.</p>
      ) : (
        <div className={categoriesPageContentMinistriesPage.list}>
          {categories.map((category) => {
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
            const name = pickLocalized(category.translations, site.defaultLocale);
            return (
              <CategoryRow
                detail={`orden ${category.order}`}
                disabled={busy}
                key={category.id}
                name={name}
                onDelete={() =>
                  void run(
                    () =>
                      apiClient.content["ministry-categories"][":id"].$delete({
                        param: { id: category.id },
                      }),
                    "Categoría eliminada",
                  )
                }
                onEdit={() => setEditing(category.id)}
                testId={`ministry-category-row-${category.id}`}
              />
            );
          })}
        </div>
      )}
    </BoardCard>
  );
}
