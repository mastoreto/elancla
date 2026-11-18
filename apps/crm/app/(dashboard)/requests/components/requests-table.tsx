"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MoneyRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatRequestAmount, getInitials } from "../utils";

interface RequestsTableProps {
  requests: MoneyRequest[];
  onSelect: (request: MoneyRequest) => void;
}

const requestsTableRequestsPage = {
  container: cn("overflow-hidden rounded-xl border border-border bg-card shadow-card"),
  dateHead: cn("w-24"),
  amountHead: cn("w-32 text-right"),
  statusHead: cn("w-28"),
  actionsHead: cn("w-16"),
  date: cn("font-mono text-xs text-muted-foreground uppercase"),
  concept: cn("flex flex-col"),
  conceptTitle: cn("font-medium"),
  conceptDescription: cn("max-w-64 truncate text-xs text-muted-foreground"),
  ministry: cn("text-muted-foreground"),
  leader: cn("flex items-center gap-2"),
  avatar: cn(
    "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-medium text-primary-foreground",
  ),
  leaderName: cn("text-sm"),
  amount: cn("text-right font-mono text-sm tabular-nums"),
  empty: cn("h-24 text-center text-muted-foreground"),
};

export function RequestsTable({ requests, onSelect }: RequestsTableProps) {
  return (
    <div className={requestsTableRequestsPage.container}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={requestsTableRequestsPage.dateHead}>Fecha</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Ministerio</TableHead>
            <TableHead>Líder</TableHead>
            <TableHead className={requestsTableRequestsPage.amountHead}>Monto</TableHead>
            <TableHead className={requestsTableRequestsPage.statusHead}>Estado</TableHead>
            <TableHead className={requestsTableRequestsPage.actionsHead}>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell className={requestsTableRequestsPage.empty} colSpan={7}>
                No se encontraron solicitudes.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className={requestsTableRequestsPage.date}>
                  {format(new Date(request.date), "d MMM", { locale: es })}
                </TableCell>
                <TableCell>
                  <div className={requestsTableRequestsPage.concept}>
                    <span className={requestsTableRequestsPage.conceptTitle}>
                      {request.concept}
                    </span>
                    {request.description ? (
                      <span className={requestsTableRequestsPage.conceptDescription}>
                        {request.description}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className={requestsTableRequestsPage.ministry}>
                  {request.ministry}
                </TableCell>
                <TableCell>
                  <div className={requestsTableRequestsPage.leader}>
                    <span aria-hidden="true" className={requestsTableRequestsPage.avatar}>
                      {getInitials(request.leader)}
                    </span>
                    <span className={requestsTableRequestsPage.leaderName}>{request.leader}</span>
                  </div>
                </TableCell>
                <TableCell className={requestsTableRequestsPage.amount}>
                  {formatRequestAmount(request.amount, request.currency)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  <Button
                    aria-label={`Ver detalle de ${request.concept}`}
                    onClick={() => onSelect(request)}
                    size="icon"
                    variant="ghost"
                  >
                    <Eye aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
