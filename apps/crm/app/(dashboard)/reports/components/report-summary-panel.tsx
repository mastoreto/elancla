import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const reportSummaryPanelReportsPage = {
  wrapper: cn("lg:sticky lg:top-5"),
  card: cn("rounded-[30px] bg-(--vino) p-[26px]"),
  kicker: cn("text-[11.5px] font-extrabold tracking-[0.12em] text-[var(--oro-100)] uppercase"),
  title: cn("my-2.5 mb-4 block font-display text-2xl leading-tight font-medium text-white"),
  list: cn("flex flex-col gap-3 text-[13.5px] text-white/80"),
  row: cn("flex justify-between"),
  value: cn("text-white"),
  action: cn(
    "mt-[22px] inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-bold text-primary",
    "transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
  ),
  icon: cn("size-[18px]"),
};

interface ReportSummaryPanelProps {
  title: string;
  period: string;
  movementCount: number;
  blocksLabel: string;
  formatLabel: string;
  canGenerate: boolean;
  onGenerate: () => void;
}

export function ReportSummaryPanel({
  title,
  period,
  movementCount,
  blocksLabel,
  formatLabel,
  canGenerate,
  onGenerate,
}: ReportSummaryPanelProps) {
  const rows = [
    ["Periodo", period],
    ["Movimientos", String(movementCount)],
    ["Bloques", blocksLabel],
    ["Formato", formatLabel],
  ] as const;

  return (
    <aside className={reportSummaryPanelReportsPage.wrapper}>
      <div className={reportSummaryPanelReportsPage.card}>
        <span className={reportSummaryPanelReportsPage.kicker}>Resumen del informe</span>
        <b className={reportSummaryPanelReportsPage.title}>{title}</b>
        <div className={reportSummaryPanelReportsPage.list}>
          {rows.map(([label, value]) => (
            <span className={reportSummaryPanelReportsPage.row} key={label}>
              <span>{label}</span>
              <b className={reportSummaryPanelReportsPage.value}>{value}</b>
            </span>
          ))}
        </div>
        <button
          className={reportSummaryPanelReportsPage.action}
          disabled={!canGenerate}
          onClick={onGenerate}
          type="button"
        >
          <Sparkles aria-hidden="true" className={reportSummaryPanelReportsPage.icon} />
          Generar informe
        </button>
      </div>
    </aside>
  );
}
