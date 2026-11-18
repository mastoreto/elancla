import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AssemblyReport } from "../types";
import { AssemblyStatusBadge } from "./assembly-status-badge";

interface AssemblyTableProps {
  reports: readonly AssemblyReport[];
}

export function AssemblyTable({ reports }: AssemblyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-bruma hover:bg-bruma">
          <TableHead>Informe</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Vigencia</TableHead>
          <TableHead>Lugar</TableHead>
          <TableHead className="text-right">Accesos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <p className="font-semibold">{report.title}</p>
              <p className="text-xs text-muted-foreground">{report.assembly}</p>
            </TableCell>
            <TableCell className="font-mono text-xs">{report.accessCode}</TableCell>
            <TableCell>
              <AssemblyStatusBadge status={report.status} />
            </TableCell>
            <TableCell>{report.validity}</TableCell>
            <TableCell>{report.place}</TableCell>
            <TableCell className="text-right tabular-nums">{report.accesses}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
