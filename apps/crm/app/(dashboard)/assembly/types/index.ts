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
  /** Attempts rejected for being outside the allowed radius. */
  blocked: number;
  /** Name of the generated report published here. */
  reportName: string;
}

export type PublicAccessState = "visible" | "not-yet" | "expired" | "revoked" | "invalid";

export interface AssemblyPublishFormValues {
  reportId: string;
  accessCode: string;
  validFrom: string;
  validTo: string;
  manualEnable: boolean;
  autoRevoke: boolean;
  address: string;
  radius: string;
  requireLocation: boolean;
}
