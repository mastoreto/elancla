"use client";

import { PERMISSIONS, type PersonProfileDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { PersonRow } from "../person-row";

const peopleListPageContentWebsitePage = {
  container: cn("flex flex-col gap-[18px]"),
  intro: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

interface PeopleListPageContentProps {
  people: readonly PersonProfileDto[];
  defaultLocale: string;
}

export function PeopleListPageContent({ people, defaultLocale }: PeopleListPageContentProps) {
  const access = useAccess();
  return (
    <div className={peopleListPageContentWebsitePage.container}>
      <div className={peopleListPageContentWebsitePage.intro}>
        <span className={peopleListPageContentWebsitePage.description}>
          Las personas que se muestran en el sitio: equipo, autores, predicadores y líderes.
        </span>
        {can(access, PERMISSIONS.people.create) ? (
          <BoardButton href={getChurchRoutePath("website", "people", "new")} variant="primary">
            <Plus aria-hidden="true" className={peopleListPageContentWebsitePage.icon} />
            Nueva persona
          </BoardButton>
        ) : null}
      </div>
      <BoardCard>
        {people.length === 0 ? (
          <p className={peopleListPageContentWebsitePage.empty}>Todavía no hay personas.</p>
        ) : (
          <div className={peopleListPageContentWebsitePage.list}>
            {people.map((person) => (
              <PersonRow defaultLocale={defaultLocale} key={person.id} person={person} />
            ))}
          </div>
        )}
      </BoardCard>
    </div>
  );
}
