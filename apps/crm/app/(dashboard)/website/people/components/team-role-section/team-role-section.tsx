import { PERSON_TITLE_MAX_LENGTH } from "@ancla/contracts";
import { BoardFormRow, BoardInput, BoardSwitchRow } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import type { SiteLocales, TeamRoleFormValues } from "../../types";
import { LocalizedTextField } from "../localized-text-field";

const teamRoleSectionWebsitePage = {
  container: cn("flex flex-col gap-4"),
  heading: cn("flex flex-col gap-[3px]"),
  title: cn("font-display text-[17px] font-medium"),
  hint: cn("text-[13px] text-[var(--tinta-apagada)]"),
};

interface TeamRoleSectionProps extends SiteLocales {
  team: TeamRoleFormValues;
  onChange: (team: TeamRoleFormValues) => void;
  disabled: boolean;
  orderError?: string;
  titleError?: string;
}

/**
 * ponytail: only the team context is editable in 1.3b. The other contexts (blog author, preacher,
 * ministry leader) get their own section here when the phase that uses them arrives; until then
 * the form sends them back unchanged.
 */
export function TeamRoleSection({
  team,
  onChange,
  disabled,
  orderError,
  titleError,
  locales,
  defaultLocale,
}: TeamRoleSectionProps) {
  return (
    <div className={teamRoleSectionWebsitePage.container}>
      <div className={teamRoleSectionWebsitePage.heading}>
        <h3 className={teamRoleSectionWebsitePage.title}>Equipo</h3>
        <span className={teamRoleSectionWebsitePage.hint}>
          Sin cargo, la persona no pertenece al equipo y no aparece en esa sección.
        </span>
      </div>
      <BoardSwitchRow
        checked={team.visible}
        disabled={disabled}
        hint="Si lo apagas, el perfil se conserva pero no se muestra en el sitio."
        onCheckedChange={(visible) => onChange({ ...team, visible })}
        title="Mostrar en el sitio web"
      />
      <BoardFormRow>
        <BoardInput
          disabled={disabled}
          error={orderError}
          hint="Los números más bajos salen primero."
          id="person-team-order"
          inputMode="numeric"
          label="Orden"
          onChange={(event) => onChange({ ...team, order: event.target.value })}
          value={team.order}
        />
      </BoardFormRow>
      <LocalizedTextField
        defaultLocale={defaultLocale}
        disabled={disabled}
        error={titleError}
        id="person-team-title"
        label="Cargo"
        locales={locales}
        maxLength={PERSON_TITLE_MAX_LENGTH}
        onChange={(locale, value) =>
          onChange({ ...team, titles: { ...team.titles, [locale]: value } })
        }
        tabsLabel="Idioma del cargo"
        values={team.titles}
      />
    </div>
  );
}
