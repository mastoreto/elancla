"use client";

import { format } from "date-fns";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentUser } from "@/lib/data";
import type { MoneyRequest } from "@/lib/types";
import { ApprovalActions } from "./approval-actions";
import { RequestTimeline } from "./request-timeline";
import { StatusBadge } from "./status-badge";

interface RequestTableProps {
  requests: MoneyRequest[];
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment?: string) => void;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function RequestTable({ requests, onApprove, onReject }: RequestTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);
  const canApprove = currentUser.role === "admin" || currentUser.role === "treasurer";

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Ministerio</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead className="w-[100px]">Moneda</TableHead>
              <TableHead className="text-right w-[120px]">Cantidad</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron solicitudes.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(request.date), "MMM d")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{request.concept}</span>
                      {request.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {request.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{request.ministry}</TableCell>
                  <TableCell className="text-muted-foreground">{request.leader}</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-muted-foreground">
                      {request.currency}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(request.amount, request.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild={true}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{request.concept}</DialogTitle>
                            <DialogDescription>
                              Request by {request.leader} from {request.ministry}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                              <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="text-2xl font-bold">
                                  {formatCurrency(request.amount, request.currency)}
                                </p>
                              </div>
                              <StatusBadge status={request.status} />
                            </div>

                            {request.description && (
                              <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-muted-foreground">
                                  {request.description}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-medium mb-3">Timeline</p>
                              <RequestTimeline timeline={request.timeline} />
                            </div>

                            {request.status === "pending" && canApprove && (
                              <div className="pt-4 border-t">
                                <ApprovalActions
                                  requestId={request.id}
                                  onApprove={onApprove}
                                  onReject={onReject}
                                />
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {request.status === "pending" && canApprove && (
                        <ApprovalActions
                          requestId={request.id}
                          onApprove={onApprove}
                          onReject={onReject}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
