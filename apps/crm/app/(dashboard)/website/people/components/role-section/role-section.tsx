import { PERSON_TITLE_MAX_LENGTH } from "@ancla/contracts";
import { LocalizedTextField } from "@/components/content/localized-text-field";
import { BoardFormRow, BoardInput, BoardSwitchRow } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import type { RoleFormValues, SiteLocales } from "../../types";
import { RoleStatsField } from "../role-stats-field";

const roleSectionWebsitePage = {
  container: cn("flex flex-col gap-4"),
  heading: cn("flex flex-col gap-[3px]"),
  title: cn("font-display text-[17px] font-medium"),
  hint: cn("text-[13px] text-[var(--tinta-apagada)]"),
};

interface RoleSectionProps extends SiteLocales {
  /** Prefix of the ids; unique per role on the page (`person-team`, `person-blog-author`). */
  id: string;
  title: string;
  hint: string;
  role: RoleFormValues;
  onChange: (role: RoleFormValues) => void;
  disabled: boolean;
  /** The role's free-form figures are only edited where they are shown (the blog author card). */
  withStats?: boolean;
  orderError?: string;
  titleError?: string;
  statsError?: string;
}

/** One context a person appears in (team, blog author): visibility, order, title and, if any, stats. */
export function RoleSection({
  id,
  title,
  hint,
  role,
  onChange,
  disabled,
  withStats = false,
  orderError,
  titleError,
  statsError,
  locales,
  defaultLocale,
}: RoleSectionProps) {
  return (
    <div className={roleSectionWebsitePage.container} data-testid={`${id}-section`}>
      <div className={roleSectionWebsitePage.heading}>
        <h3 className={roleSectionWebsitePage.title}>{title}</h3>
        <span className={roleSectionWebsitePage.hint}>{hint}</span>
      </div>
      <BoardSwitchRow
        checked={role.visible}
        disabled={disabled}
        hint="Si lo apagas, el perfil se conserva pero no se muestra en el sitio."
        onCheckedChange={(visible) => onChange({ ...role, visible })}
        title="Mostrar en el sitio web"
      />
      <BoardFormRow>
        <BoardInput
          disabled={disabled}
          error={orderError}
          hint="Los números más bajos salen primero."
          id={`${id}-order`}
          inputMode="numeric"
          label="Orden"
          onChange={(event) => onChange({ ...role, order: event.target.value })}
          value={role.order}
        />
      </BoardFormRow>
      <LocalizedTextField
        defaultLocale={defaultLocale}
        disabled={disabled}
        error={titleError}
        id={`${id}-title`}
        label="Cargo"
        locales={locales}
        maxLength={PERSON_TITLE_MAX_LENGTH}
        onChange={(locale, value) =>
          onChange({ ...role, titles: { ...role.titles, [locale]: value } })
        }
        tabsLabel="Idioma del cargo"
        values={role.titles}
      />
      {withStats ? (
        <RoleStatsField
          defaultLocale={defaultLocale}
          disabled={disabled}
          error={statsError}
          id={id}
          label="Estadísticas"
          locales={locales}
          onChange={(stats) => onChange({ ...role, stats })}
          stats={role.stats}
        />
      ) : null}
    </div>
  );
}
