import { AUDIT_OUTCOMES } from "@ancla/contracts";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { boardControlStyles } from "@/components/dashboard/board/board-field";
import { cn } from "@/lib/utils";
import { AUDIT_ACTION_OPTIONS, AUDIT_OUTCOME_LABELS } from "../data/audit-labels";
import type { AuditFilters } from "../utils/audit-filters";

const auditFiltersFormSettingsPage = {
  form: cn("flex flex-wrap items-end gap-3"),
  field: cn("flex flex-col gap-1.5"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  control: cn(boardControlStyles.shell, "min-h-[42px] w-auto rounded-full px-3.5 py-0"),
  input: cn(boardControlStyles.input, "py-2"),
};

interface AuditFiltersFormProps {
  filters: AuditFilters;
  /** Where the form submits to (this same page). */
  action: string;
}

/** A plain GET form: the URL is the state, so the page stays a Server Component with no client JS. */
export function AuditFiltersForm({ filters, action }: AuditFiltersFormProps) {
  return (
    <form action={action} className={auditFiltersFormSettingsPage.form} method="get">
      <label className={auditFiltersFormSettingsPage.field}>
        <span className={auditFiltersFormSettingsPage.label}>Acción</span>
        <span className={auditFiltersFormSettingsPage.control}>
          <select
            className={auditFiltersFormSettingsPage.input}
            defaultValue={filters.action ?? ""}
            name="action"
          >
            <option value="">Todas</option>
            {AUDIT_ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
      </label>
      <label className={auditFiltersFormSettingsPage.field}>
        <span className={auditFiltersFormSettingsPage.label}>Resultado</span>
        <span className={auditFiltersFormSettingsPage.control}>
          <select
            className={auditFiltersFormSettingsPage.input}
            defaultValue={filters.outcome ?? ""}
            name="outcome"
          >
            <option value="">Todos</option>
            {AUDIT_OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>
                {AUDIT_OUTCOME_LABELS[outcome]}
              </option>
            ))}
          </select>
        </span>
      </label>
      <label className={auditFiltersFormSettingsPage.field}>
        <span className={auditFiltersFormSettingsPage.label}>Quién (correo)</span>
        <span className={auditFiltersFormSettingsPage.control}>
          <input
            className={auditFiltersFormSettingsPage.input}
            defaultValue={filters.actor ?? ""}
            maxLength={200}
            name="actor"
            type="search"
          />
        </span>
      </label>
      <label className={auditFiltersFormSettingsPage.field}>
        <span className={auditFiltersFormSettingsPage.label}>Desde</span>
        <span className={auditFiltersFormSettingsPage.control}>
          <input
            className={auditFiltersFormSettingsPage.input}
            defaultValue={filters.from ?? ""}
            name="from"
            type="date"
          />
        </span>
      </label>
      <label className={auditFiltersFormSettingsPage.field}>
        <span className={auditFiltersFormSettingsPage.label}>Hasta</span>
        <span className={auditFiltersFormSettingsPage.control}>
          <input
            className={auditFiltersFormSettingsPage.input}
            defaultValue={filters.to ?? ""}
            name="to"
            type="date"
          />
        </span>
      </label>
      <BoardButton type="submit" variant="primary">
        Filtrar
      </BoardButton>
    </form>
  );
}
