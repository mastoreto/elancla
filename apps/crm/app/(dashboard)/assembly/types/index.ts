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

export type PublicAccessState = "visible" | "not-yet" | "expired" | "revoked" | "invalid";

export interface AssemblyPublishFormValues {
  title: string;
  assembly: string;
  validFrom: string;
  validTo: string;
  place: string;
  sections: string[];
  enableNow: boolean;
}
