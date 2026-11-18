import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { AssemblyReport } from "../types";
import { AssemblyStatusBadge } from "./assembly-status-badge";

const assemblyTableAssemblyPage = {
  headRow: cn("bg-bruma hover:bg-bruma"),
  numeric: cn("text-right"),
  numericCell: cn("text-right tabular-nums"),
  title: cn("font-semibold hover:underline"),
  assembly: cn("text-xs text-muted-foreground"),
  code: cn("font-mono text-xs"),
};

interface AssemblyTableProps {
  reports: readonly AssemblyReport[];
}

export function AssemblyTable({ reports }: AssemblyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={assemblyTableAssemblyPage.headRow}>
          <TableHead>Informe</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Vigencia</TableHead>
          <TableHead>Lugar</TableHead>
          <TableHead className={assemblyTableAssemblyPage.numeric}>Accesos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <Link
                className={assemblyTableAssemblyPage.title}
                href={getChurchRoutePath("assembly", report.id)}
              >
                {report.title}
              </Link>
              <p className={assemblyTableAssemblyPage.assembly}>{report.assembly}</p>
            </TableCell>
            <TableCell className={assemblyTableAssemblyPage.code}>{report.accessCode}</TableCell>
            <TableCell>
              <AssemblyStatusBadge status={report.status} />
            </TableCell>
            <TableCell>{report.validity}</TableCell>
            <TableCell>{report.place}</TableCell>
            <TableCell className={assemblyTableAssemblyPage.numericCell}>
              {report.accesses}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
