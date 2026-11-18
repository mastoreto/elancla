import type { StatusPillTone } from "@/components/dashboard/board/status-pill";
import type { AssemblyReport, AssemblyReportStatus } from "../types";

export const ASSEMBLY_STATUS_TONE = {
  Abierto: "green",
  Programado: "gold",
  "Sin habilitar": "ink",
  Vencido: "ink",
  "Dado de baja": "rose",
} as const satisfies Record<AssemblyReportStatus, StatusPillTone>;

export type AssemblyFilter = "all" | "open" | "scheduled" | "expired" | "revoked";

const FILTER_STATUSES = {
  open: ["Abierto"],
  scheduled: ["Programado", "Sin habilitar"],
  expired: ["Vencido"],
  revoked: ["Dado de baja"],
} as const satisfies Record<Exclude<AssemblyFilter, "all">, readonly AssemblyReportStatus[]>;

export function filterAssemblyReports(
  reports: readonly AssemblyReport[],
  filter: AssemblyFilter,
  search: string,
): AssemblyReport[] {
  const query = search.trim().toLowerCase();

  return reports.filter((report) => {
    if (
      filter !== "all" &&
      !(FILTER_STATUSES[filter] as readonly string[]).includes(report.status)
    ) {
      return false;
    }
    if (!query) return true;
    return `${report.title} ${report.accessCode}`.toLowerCase().includes(query);
  });
}

export function summarizeAssembly(reports: readonly AssemblyReport[]) {
  const open = reports.filter((report) => report.status === "Abierto");
  const scheduled = reports.filter((report) =>
    FILTER_STATUSES.scheduled.some((s) => s === report.status),
  );

  return {
    open: open.length,
    openAssembly: open[0]?.assembly ?? "Ninguna en curso",
    scheduled: scheduled.length,
    accesses: reports.reduce((total, report) => total + report.accesses, 0),
    lastAccesses: open[0]?.accesses ?? 0,
    blocked: reports.reduce((total, report) => total + report.blocked, 0),
  };
}

/** Short public link for a code: "ASM-7K4Q92" → "iekklesia.app/a/7K4Q92". */
export function buildAccessLink(code: string): string {
  return `iekklesia.app/a/${code.replace(/^ASM-/, "")}`;
}

export type AssemblyPanelMode = "open" | "closed" | "ended";

export function getPanelMode(status: AssemblyReportStatus): AssemblyPanelMode {
  if (status === "Abierto") return "open";
  if (status === "Programado" || status === "Sin habilitar") return "closed";
  return "ended";
}

export const LIFECYCLE_STEPS = ["Creado", "Compartido", "Habilitado", "Dado de baja"] as const;

/** Index of the lifecycle step the report is on right now. */
export function getLifecycleIndex(status: AssemblyReportStatus): number {
  switch (getPanelMode(status)) {
    case "closed":
      return 1;
    case "open":
      return 2;
    default:
      return 3;
  }
}

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

/** "2026-11-24T10:30" + "2026-11-24T14:00" → "24 nov · 10:30–14:00". */
export function describeValidity(from: string, to: string): string {
  const [fromDate = "", fromTime = ""] = from.split("T");
  const [, toTime = ""] = to.split("T");
  const [, month = "", day = ""] = fromDate.split("-");
  const monthName = MONTHS[Number(month) - 1];
  if (!(monthName && fromTime && toTime)) return "Sin definir";
  return `${Number(day)} ${monthName} · ${fromTime}–${toTime}`;
}
