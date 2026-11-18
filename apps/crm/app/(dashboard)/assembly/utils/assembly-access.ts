import { assemblyReports } from "../data/assembly-reports";
import type { AssemblyReport, PublicAccessState } from "../types";

export function getAssemblyReport(id: string): AssemblyReport | null {
  return assemblyReports.find((report) => report.id === id) ?? null;
}

export function getAssemblyReportByCode(code: string): AssemblyReport | null {
  const normalized = code.trim().toUpperCase();
  return assemblyReports.find((report) => report.accessCode === normalized) ?? null;
}

export function getPublicAccessState(report: AssemblyReport | null): PublicAccessState {
  if (!report) {
    return "invalid";
  }
  switch (report.status) {
    case "Abierto":
      return "visible";
    case "Vencido":
      return "expired";
    case "Dado de baja":
      return "revoked";
    default:
      return "not-yet";
  }
}
