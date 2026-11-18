import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Sermon } from "../types";
import { SermonStatusBadge } from "./sermon-status-badge";

interface SermonsTableProps {
  sermons: Sermon[];
}

const sermonsTableSermonsPage = {
  container: cn("overflow-hidden rounded-xl border border-border bg-card shadow-card"),
  numericHead: cn("text-right"),
  title: cn("font-medium"),
  meta: cn("text-xs text-muted-foreground"),
  series: cn("text-muted-foreground"),
  numeric: cn("text-right font-mono text-sm tabular-nums"),
  muted: cn("text-muted-foreground"),
  empty: cn("h-24 text-center text-muted-foreground"),
};

const NUMBER_FORMAT = new Intl.NumberFormat("es-UY");

export function SermonsTable({ sermons }: SermonsTableProps) {
  return (
    <div className={sermonsTableSermonsPage.container}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sermón</TableHead>
            <TableHead>Serie</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className={sermonsTableSermonsPage.numericHead}>Reproducciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sermons.length === 0 ? (
            <TableRow>
              <TableCell className={sermonsTableSermonsPage.empty} colSpan={5}>
                No se encontraron sermones.
              </TableCell>
            </TableRow>
          ) : (
            sermons.map((sermon) => (
              <TableRow key={sermon.id}>
                <TableCell>
                  <p className={sermonsTableSermonsPage.title}>{sermon.title}</p>
                  <p className={sermonsTableSermonsPage.meta}>
                    {sermon.preacher} · {sermon.passage}
                  </p>
                </TableCell>
                <TableCell className={sermonsTableSermonsPage.series}>{sermon.series}</TableCell>
                <TableCell>
                  <SermonStatusBadge status={sermon.status} />
                </TableCell>
                <TableCell className={sermonsTableSermonsPage.muted}>
                  {sermon.date ? format(new Date(sermon.date), "d MMM", { locale: es }) : "—"}
                </TableCell>
                <TableCell className={sermonsTableSermonsPage.numeric}>
                  {sermon.plays === undefined ? "—" : NUMBER_FORMAT.format(sermon.plays)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
