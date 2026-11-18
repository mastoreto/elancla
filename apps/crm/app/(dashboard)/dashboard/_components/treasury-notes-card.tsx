import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";

const notes = [
  {
    label: "Prioridad alta",
    text: "Conciliar los movimientos de marzo antes de cerrar el informe mensual.",
    highlighted: true,
  },
  {
    label: "Seguimiento",
    text: "Validar comprobantes pendientes del campamento de jóvenes y avisar al responsable.",
  },
  {
    label: "Contenido",
    text: "Preparar resumen financiero para la próxima reunión administrativa.",
  },
];

const treasuryNotesCardDashboardPage = {
  list: cn("flex flex-col gap-3"),
  note: cn("rounded-[14px] border border-border bg-card p-4 data-[highlighted=true]:bg-bruma"),
  label: cn("mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"),
  text: cn("text-sm leading-6 text-foreground"),
};

export function TreasuryNotesCard() {
  return (
    <DashboardCard>
      <DashboardCardHeader subtitle="Recordatorios del equipo" title="Notas de tesorería" />
      <ul className={treasuryNotesCardDashboardPage.list}>
        {notes.map((note) => (
          <li
            className={treasuryNotesCardDashboardPage.note}
            data-highlighted={note.highlighted || undefined}
            key={note.label}
          >
            <div className={treasuryNotesCardDashboardPage.label}>
              {note.label}
            </div>
            <p className={treasuryNotesCardDashboardPage.text}>{note.text}</p>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
