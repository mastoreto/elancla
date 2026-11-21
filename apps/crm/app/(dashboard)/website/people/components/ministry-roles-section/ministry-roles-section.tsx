import type { PersonMinistryRoleDto } from "@ancla/contracts";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const ministryRolesSectionWebsitePage = {
  container: cn("flex flex-col gap-2"),
  legend: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  list: cn("flex flex-col gap-1.5"),
  link: cn("text-[14px] font-bold underline-offset-2 hover:underline"),
  detail: cn("text-[13px] text-[var(--tinta-apagada)]"),
};

interface MinistryRolesSectionProps {
  roles: readonly PersonMinistryRoleDto[];
  defaultLocale: string;
}

/** The ministries a person leads. Read-only: they are edited from the ministry itself. */
export function MinistryRolesSection({ roles, defaultLocale }: MinistryRolesSectionProps) {
  return (
    <div className={ministryRolesSectionWebsitePage.container} data-testid="person-ministry-roles">
      <span className={ministryRolesSectionWebsitePage.legend}>Ministerios que lidera</span>
      <span className={ministryRolesSectionWebsitePage.hint}>
        Se editan desde el ministerio, en su tarjeta de responsables.
      </span>
      <ul className={ministryRolesSectionWebsitePage.list}>
        {roles.map((role) => {
          const title =
            role.translations[defaultLocale]?.title ?? Object.values(role.translations)[0]?.title;
          return (
            <li key={role.ministryId}>
              <Link
                className={ministryRolesSectionWebsitePage.link}
                href={getChurchRoutePath("ministries", role.ministryId)}
              >
                {role.ministryName}
              </Link>
              <span className={ministryRolesSectionWebsitePage.detail}>
                {title ? ` · ${title}` : ""}
                {role.visible ? "" : " · oculto en el sitio"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
