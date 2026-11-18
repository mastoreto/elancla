import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportFormat } from "../types";
import type { ReportBuilderBlocks } from "../utils/report-builder";

const BLOCK_LABELS = {
  summary: "Tarjetas de resumen",
  charts: "Gráficos de comparación y distribución",
  movements: "Detalle de movimientos",
} as const satisfies Record<keyof ReportBuilderBlocks, string>;

const FORMAT_OPTIONS = [
  { value: "PDF", label: "PDF" },
  { value: "CSV", label: "CSV" },
  { value: "PDF_CSV", label: "PDF y CSV" },
] as const satisfies readonly { value: ReportFormat; label: string }[];

const reportOutputSectionReportsPage = {
  wrapper: cn("flex flex-col gap-4"),
  caption: cn("text-[13px] text-[var(--tinta-suave)]"),
  block: cn("inline-flex items-center gap-2.5 text-sm"),
  box: cn(
    "inline-flex size-[22px] items-center justify-center rounded-[7px] bg-card text-white shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  boxChecked: cn("bg-(image:--grad-granada) shadow-none"),
  check: cn("size-3.5"),
  formats: cn("flex gap-2"),
  format: cn(
    "inline-flex h-[34px] items-center rounded-full bg-card px-3.5 text-[13px] font-semibold whitespace-nowrap text-[var(--tinta-suave)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  formatActive: cn("bg-foreground text-white shadow-none"),
};

interface ReportOutputSectionProps {
  blocks: ReportBuilderBlocks;
  onBlocksChange: (blocks: ReportBuilderBlocks) => void;
  format: ReportFormat;
  onFormatChange: (format: ReportFormat) => void;
}

export function ReportOutputSection({
  blocks,
  onBlocksChange,
  format,
  onFormatChange,
}: ReportOutputSectionProps) {
  return (
    <div className={reportOutputSectionReportsPage.wrapper}>
      <b className={reportOutputSectionReportsPage.caption}>Bloques incluidos</b>
      {(Object.keys(BLOCK_LABELS) as (keyof ReportBuilderBlocks)[]).map((key) => (
        <label className={reportOutputSectionReportsPage.block} key={key}>
          <input
            checked={blocks[key]}
            className="sr-only"
            onChange={(event) => onBlocksChange({ ...blocks, [key]: event.target.checked })}
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className={cn(
              reportOutputSectionReportsPage.box,
              blocks[key] && reportOutputSectionReportsPage.boxChecked,
            )}
          >
            {blocks[key] ? <Check className={reportOutputSectionReportsPage.check} /> : null}
          </span>
          {BLOCK_LABELS[key]}
        </label>
      ))}
      <b className={reportOutputSectionReportsPage.caption}>Formato de salida</b>
      {/* biome-ignore lint/a11y/useSemanticElements: a fieldset would bring its own borders and legend. */}
      <div
        aria-label="Formato de salida"
        className={reportOutputSectionReportsPage.formats}
        role="group"
      >
        {FORMAT_OPTIONS.map((option) => (
          <button
            aria-pressed={format === option.value}
            className={cn(
              reportOutputSectionReportsPage.format,
              format === option.value && reportOutputSectionReportsPage.formatActive,
            )}
            key={option.value}
            onClick={() => onFormatChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
