export type AssemblyReportStatus =
  | "Abierto"
  | "Programado"
  | "Sin habilitar"
  | "Vencido"
  | "Dado de baja";

export interface AssemblyReport {
  id: string;
  title: string;
  assembly: string;
  accessCode: string;
  status: AssemblyReportStatus;
  validity: string;
  place: string;
  accesses: number;
}
