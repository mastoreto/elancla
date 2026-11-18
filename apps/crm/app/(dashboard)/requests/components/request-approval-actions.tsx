"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RequestApprovalActionsProps {
  requestId: string;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment?: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RequestApprovalActions({
  requestId,
  onApprove,
  onReject,
  disabled = false,
  className,
}: RequestApprovalActionsProps) {
  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const requestApprovalActionsRequestsPage = {
    container: cn("flex items-center gap-2", className),
    approve: cn("border-income text-income hover:bg-income hover:text-income-foreground"),
    reject: cn("border-expense text-expense hover:bg-expense hover:text-expense-foreground"),
    buttonIcon: cn("mr-1.5 size-4"),
    field: cn("py-4"),
    label: cn("text-sm font-medium"),
    textarea: cn("mt-2"),
    confirmApprove: cn("bg-income text-income-foreground hover:bg-income/90"),
    confirmReject: cn("bg-expense text-expense-foreground hover:bg-expense/90"),
  };

  return (
    <div className={requestApprovalActionsRequestsPage.container}>
      <AlertDialog>
        <AlertDialogTrigger asChild={true}>
          <Button
            className={requestApprovalActionsRequestsPage.approve}
            disabled={disabled}
            size="sm"
            variant="outline"
          >
            <CheckCircle2 className={requestApprovalActionsRequestsPage.buttonIcon} />
            Aprobar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprobar solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres aprobar esta solicitud de fondos? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className={requestApprovalActionsRequestsPage.field}>
            <Label className={requestApprovalActionsRequestsPage.label} htmlFor="approve-comment">
              Comentario (opcional)
            </Label>
            <Textarea
              className={requestApprovalActionsRequestsPage.textarea}
              id="approve-comment"
              onChange={(event) => setApproveComment(event.target.value)}
              placeholder="Añade notas sobre esta aprobación..."
              value={approveComment}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={requestApprovalActionsRequestsPage.confirmApprove}
              onClick={() => {
                onApprove(requestId, approveComment || undefined);
                setApproveComment("");
              }}
            >
              Aprobar solicitud
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild={true}>
          <Button
            className={requestApprovalActionsRequestsPage.reject}
            disabled={disabled}
            size="sm"
            variant="outline"
          >
            <XCircle className={requestApprovalActionsRequestsPage.buttonIcon} />
            Rechazar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres rechazar esta solicitud de fondos? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className={requestApprovalActionsRequestsPage.field}>
            <Label className={requestApprovalActionsRequestsPage.label} htmlFor="reject-comment">
              Razón del rechazo (opcional)
            </Label>
            <Textarea
              className={requestApprovalActionsRequestsPage.textarea}
              id="reject-comment"
              onChange={(event) => setRejectComment(event.target.value)}
              placeholder="Explica por qué se rechaza esta solicitud..."
              value={rejectComment}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={requestApprovalActionsRequestsPage.confirmReject}
              onClick={() => {
                onReject(requestId, rejectComment || undefined);
                setRejectComment("");
              }}
            >
              Rechazar solicitud
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
