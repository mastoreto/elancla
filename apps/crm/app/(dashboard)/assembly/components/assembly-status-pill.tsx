import { StatusPill } from "@/components/dashboard/board/status-pill";
import type { AssemblyReportStatus } from "../types";
import { ASSEMBLY_STATUS_TONE } from "../utils/assembly-view";

export function AssemblyStatusPill({ status }: { status: AssemblyReportStatus }) {
  return <StatusPill tone={ASSEMBLY_STATUS_TONE[status]}>{status}</StatusPill>;
}
