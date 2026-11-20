import type { PersonProfileDto } from "@ancla/contracts";
import Link from "next/link";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { PERSON_CONTEXT_LABELS } from "../../data/personContextLabels";
import { summarizePersonRoles } from "../../utils/summarizePersonRoles";
import { PersonAvatar } from "../person-avatar";

const personRowWebsitePage = {
  container: cn(
    "flex items-center gap-4 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)] focus-visible:bg-[var(--oro-50)]",
  ),
  text: cn("flex min-w-0 flex-1 flex-col gap-1.5"),
  name: cn("truncate text-[15px] font-bold"),
  roles: cn("flex flex-wrap items-center gap-1.5"),
  noRoles: cn("text-[13px] text-[var(--tinta-apagada)]"),
};

interface PersonRowProps {
  person: PersonProfileDto;
  defaultLocale: string;
}

export function PersonRow({ person, defaultLocale }: PersonRowProps) {
  const roles = summarizePersonRoles(person, defaultLocale);
  return (
    <Link
      className={personRowWebsitePage.container}
      href={getChurchRoutePath("website", "people", person.id)}
    >
      <PersonAvatar name={person.name} photo={person.photo} />
      <span className={personRowWebsitePage.text}>
        <span className={personRowWebsitePage.name}>{person.name}</span>
        {roles.length === 0 ? (
          <span className={personRowWebsitePage.noRoles}>Sin roles</span>
        ) : (
          <span className={personRowWebsitePage.roles}>
            {roles.map((role) => (
              <StatusPill key={role.context} tone={role.visible ? "gold" : "ink"}>
                {PERSON_CONTEXT_LABELS[role.context]}
                {role.title ? ` · ${role.title}` : ""}
                {role.visible ? "" : " · Oculto"}
              </StatusPill>
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}
