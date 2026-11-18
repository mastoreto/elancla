import { MapPin } from "lucide-react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { cn } from "@/lib/utils";
import { PLACE_SAMPLE } from "../data/assembly-panel-samples";
import type { AssemblyReport } from "../types";

const assemblyPlaceCardAssemblyPage = {
  card: cn("p-6"),
  map: cn(
    "mb-3.5 flex h-28 items-center justify-center rounded-[20px] bg-secondary text-primary",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,0.035)_0_1px,transparent_1px_9px)]",
  ),
  pin: cn("size-8"),
  row: cn("flex justify-between gap-3 border-b border-border py-[11px] text-sm last:border-b-0"),
  label: cn("text-[var(--tinta-apagada)]"),
  value: cn("text-right"),
};

export function AssemblyPlaceCard({ report }: { report: AssemblyReport }) {
  const rows = [
    ["Dirección", PLACE_SAMPLE.address],
    ["Ubicación del dispositivo", PLACE_SAMPLE.deviceLocation],
    ["Datos guardados", PLACE_SAMPLE.storedData],
  ] as const;

  return (
    <BoardCard className={assemblyPlaceCardAssemblyPage.card}>
      <BoardCardHeader
        subtitle={`${report.place} · radio ${PLACE_SAMPLE.radius}`}
        title="Lugar y alcance"
      />
      <div aria-hidden="true" className={assemblyPlaceCardAssemblyPage.map}>
        <MapPin className={assemblyPlaceCardAssemblyPage.pin} />
      </div>
      {rows.map(([label, value]) => (
        <div className={assemblyPlaceCardAssemblyPage.row} key={label}>
          <span className={assemblyPlaceCardAssemblyPage.label}>{label}</span>
          <b className={assemblyPlaceCardAssemblyPage.value}>{value}</b>
        </div>
      ))}
    </BoardCard>
  );
}
