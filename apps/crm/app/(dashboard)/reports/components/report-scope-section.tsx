import { Banknote } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { BoardField } from "@/components/dashboard/board/board-field";
import { BoardFormRow, BoardInput, BoardSelect } from "@/components/dashboard/board/board-form";
import { DateRangePill } from "@/components/dashboard/board/date-range-pill";
import { cn } from "@/lib/utils";
import {
  currencyOptions,
  ministryScopeOptions,
  movementTypeOptions,
  projectScopeOptions,
  responsibleOptions,
} from "../data/report-scope-options";

export interface ReportScopeValues {
  name: string;
  range: DateRange | undefined;
  currency: string;
  ministry: string;
  project: string;
  movementType: string;
  responsible: string;
  minAmount: string;
  maxAmount: string;
}

const reportScopeSectionReportsPage = {
  fields: cn("flex flex-col gap-3.5"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
};

interface ReportScopeSectionProps {
  values: ReportScopeValues;
  onChange: (patch: Partial<ReportScopeValues>) => void;
}

export function ReportScopeSection({ values, onChange }: ReportScopeSectionProps) {
  const moneyIcon = <Banknote aria-hidden="true" className={reportScopeSectionReportsPage.icon} />;

  return (
    <div className={reportScopeSectionReportsPage.fields}>
      <BoardInput
        id="report-name"
        label="Nombre del reporte"
        onChange={(event) => onChange({ name: event.target.value })}
        placeholder="Resumen general · noviembre 2026"
        value={values.name}
      />
      <BoardFormRow>
        <BoardField label="Rango de fechas">
          <DateRangePill onChange={(range) => onChange({ range })} value={values.range} />
        </BoardField>
        <BoardSelect
          id="report-currency"
          label="Moneda"
          onValueChange={(currency) => onChange({ currency })}
          options={currencyOptions}
          value={values.currency}
        />
        <BoardSelect
          id="report-ministry"
          label="Ministerio"
          onValueChange={(ministry) => onChange({ ministry })}
          options={ministryScopeOptions}
          value={values.ministry}
        />
        <BoardSelect
          id="report-project"
          label="Proyecto"
          onValueChange={(project) => onChange({ project })}
          options={projectScopeOptions}
          value={values.project}
        />
        <BoardSelect
          id="report-type"
          label="Tipo de movimiento"
          onValueChange={(movementType) => onChange({ movementType })}
          options={movementTypeOptions}
          value={values.movementType}
        />
        <BoardSelect
          id="report-responsible"
          label="Responsable"
          onValueChange={(responsible) => onChange({ responsible })}
          options={responsibleOptions}
          value={values.responsible}
        />
        <BoardInput
          icon={moneyIcon}
          id="report-min"
          inputMode="numeric"
          label="Monto mínimo"
          min="0"
          onChange={(event) => onChange({ minAmount: event.target.value })}
          placeholder="0"
          type="number"
          value={values.minAmount}
        />
        <BoardInput
          icon={moneyIcon}
          id="report-max"
          inputMode="numeric"
          label="Monto máximo"
          min="0"
          onChange={(event) => onChange({ maxAmount: event.target.value })}
          placeholder="Sin límite"
          type="number"
          value={values.maxAmount}
        />
      </BoardFormRow>
    </div>
  );
}
