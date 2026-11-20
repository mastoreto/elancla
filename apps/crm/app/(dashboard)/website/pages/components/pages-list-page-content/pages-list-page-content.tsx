"use client";

import { PERMISSIONS, type SimplePageListItemDto } from "@ancla/contracts";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { cn } from "@/lib/utils";
import { NewPageButton } from "../new-page-button";
import { PageRow } from "../page-row";

const pagesListPageContentWebsitePage = {
  container: cn("flex flex-col gap-[18px]"),
  intro: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
};

interface PagesListPageContentProps {
  pages: readonly SimplePageListItemDto[];
}

export function PagesListPageContent({ pages }: PagesListPageContentProps) {
  const access = useAccess();
  return (
    <div className={pagesListPageContentWebsitePage.container}>
      <div className={pagesListPageContentWebsitePage.intro}>
        <span className={pagesListPageContentWebsitePage.description}>
          Páginas sencillas del sitio, como la política de privacidad o los términos de uso.
        </span>
        {can(access, PERMISSIONS.pages.create) ? <NewPageButton /> : null}
      </div>
      <BoardCard>
        {pages.length === 0 ? (
          <p className={pagesListPageContentWebsitePage.empty}>Todavía no hay páginas.</p>
        ) : (
          <div className={pagesListPageContentWebsitePage.list}>
            {pages.map((page) => (
              <PageRow key={page.id} page={page} />
            ))}
          </div>
        )}
      </BoardCard>
    </div>
  );
}
