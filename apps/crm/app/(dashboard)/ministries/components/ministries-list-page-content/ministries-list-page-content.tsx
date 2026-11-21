"use client";

import { type MinistryCategoryDto, type MinistryListItemDto, PERMISSIONS } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { useAccess } from "@/lib/authz/AccessProvider";
import { canWithAllScope } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { pickLocalized } from "../../utils/pickLocalized";
import { MinistryRow } from "../ministry-row";
import { NewMinistryButton } from "../new-ministry-button";

const ministriesListPageContentMinistriesPage = {
  container: cn("flex flex-col gap-[18px]"),
  intro: cn("flex flex-wrap items-center gap-4"),
  description: cn("min-w-60 flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  list: cn("flex flex-col gap-1"),
  legend: cn("flex justify-end gap-4 px-3 text-xs font-bold text-[var(--tinta-apagada)]"),
  legendDestination: cn("w-28"),
  legendLanding: cn("w-24"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

interface MinistriesListPageContentProps {
  ministries: readonly MinistryListItemDto[];
  categories: readonly MinistryCategoryDto[];
  defaultLocale: string;
}

export function MinistriesListPageContent({
  ministries,
  categories,
  defaultLocale,
}: MinistriesListPageContentProps) {
  const access = useAccess();
  const canConfigure = canWithAllScope(access, PERMISSIONS.ministryProfile.edit);
  const canCreate = canWithAllScope(access, PERMISSIONS.ministryProfile.create);
  const categoryName = (categoryId: string | null): string | undefined => {
    const category = categories.find((candidate) => candidate.id === categoryId);
    return category ? pickLocalized(category.translations, defaultLocale) : undefined;
  };

  return (
    <div className={ministriesListPageContentMinistriesPage.container}>
      <div className={ministriesListPageContentMinistriesPage.intro}>
        <span className={ministriesListPageContentMinistriesPage.description}>
          Los ministerios de la iglesia: su perfil público, su estado editorial y si salen en la
          landing.
        </span>
        {canConfigure ? (
          <>
            <BoardButton href={getChurchRoutePath("ministries", "landing")} variant="outline">
              Mosaico de la landing
            </BoardButton>
            <BoardButton href={getChurchRoutePath("ministries", "categories")} variant="outline">
              Categorías
            </BoardButton>
          </>
        ) : null}
        {canCreate ? <NewMinistryButton /> : null}
      </div>
      <BoardCard>
        {ministries.length === 0 ? (
          <p className={ministriesListPageContentMinistriesPage.empty}>
            Todavía no hay ministerios.
          </p>
        ) : (
          <div className={ministriesListPageContentMinistriesPage.list}>
            <div aria-hidden="true" className={ministriesListPageContentMinistriesPage.legend}>
              <span className={ministriesListPageContentMinistriesPage.legendDestination}>
                Destino
              </span>
              <span className={ministriesListPageContentMinistriesPage.legendLanding}>
                En la landing
              </span>
            </div>
            {ministries.map((ministry) => (
              <MinistryRow
                categoryName={categoryName(ministry.categoryId)}
                key={ministry.id}
                ministry={ministry}
              />
            ))}
          </div>
        )}
      </BoardCard>
    </div>
  );
}
