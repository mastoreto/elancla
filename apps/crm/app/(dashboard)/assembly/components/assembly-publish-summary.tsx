import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";

const assemblyPublishSummaryAssemblyPage = {
  wrapper: cn("lg:sticky lg:top-5"),
  card: cn("rounded-[30px] bg-(--vino) p-[26px]"),
  kicker: cn("text-[11.5px] font-extrabold tracking-[0.12em] text-[var(--oro-100)] uppercase"),
  title: cn("my-2.5 mb-4 block font-display text-2xl leading-tight font-medium text-white"),
  list: cn("flex flex-col gap-3 text-[13.5px] text-white/80"),
  row: cn("flex justify-between gap-3"),
  value: cn("text-right text-white"),
  actions: cn("mt-[22px] flex flex-col gap-2.5"),
  primary: cn("w-full bg-white text-primary shadow-none hover:bg-white/90"),
  secondary: cn(
    "w-full bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] hover:bg-white/15",
  ),
};

interface AssemblyPublishSummaryProps {
  title: string;
  rows: readonly (readonly [string, string])[];
  onCreate: () => void;
  onSaveDraft: () => void;
  canCreate: boolean;
}

export function AssemblyPublishSummary({
  title,
  rows,
  onCreate,
  onSaveDraft,
  canCreate,
}: AssemblyPublishSummaryProps) {
  return (
    <aside className={assemblyPublishSummaryAssemblyPage.wrapper}>
      <div className={assemblyPublishSummaryAssemblyPage.card}>
        <span className={assemblyPublishSummaryAssemblyPage.kicker}>Resumen</span>
        <b className={assemblyPublishSummaryAssemblyPage.title}>{title}</b>
        <div className={assemblyPublishSummaryAssemblyPage.list}>
          {rows.map(([label, value]) => (
            <span className={assemblyPublishSummaryAssemblyPage.row} key={label}>
              <span>{label}</span>
              <b className={assemblyPublishSummaryAssemblyPage.value}>{value}</b>
            </span>
          ))}
        </div>
        <div className={assemblyPublishSummaryAssemblyPage.actions}>
          <BoardButton
            className={assemblyPublishSummaryAssemblyPage.primary}
            disabled={!canCreate}
            onClick={onCreate}
            size="lg"
          >
            Crear publicación
          </BoardButton>
          <BoardButton
            className={assemblyPublishSummaryAssemblyPage.secondary}
            onClick={onSaveDraft}
          >
            Guardar borrador
          </BoardButton>
        </div>
      </div>
    </aside>
  );
}
