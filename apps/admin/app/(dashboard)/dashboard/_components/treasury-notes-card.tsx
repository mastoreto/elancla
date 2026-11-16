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

export function TreasuryNotesCard() {
  return (
    <DashboardCard>
      <DashboardCardHeader subtitle="Recordatorios del equipo" title="Notas de tesorería" />
      <ul className="flex flex-col gap-3">
        {notes.map((note) => (
          <li
            className="rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] p-4 data-[highlighted=true]:bg-[var(--dashboard-surface-muted)]"
            data-highlighted={note.highlighted || undefined}
            key={note.label}
          >
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {note.label}
            </div>
            <p className="text-sm leading-6 text-foreground">{note.text}</p>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
