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

interface ApprovalActionsProps {
  requestId: string;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment?: string) => void;
  disabled?: boolean;
}

export function ApprovalActions({
  requestId,
  onApprove,
  onReject,
  disabled = false,
}: ApprovalActionsProps) {
  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");

  return (
    <div className="flex items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild={true}>
          <Button
            size="sm"
            variant="outline"
            className="border-income text-income hover:bg-income hover:text-income-foreground"
            disabled={disabled}
          >
            <CheckCircle2 className="mr-1.5 size-4" />
            Approve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprobar Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas aprobar esta solicitud de fondos? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="approve-comment" className="text-sm font-medium">
              Comentario (opcional)
            </Label>
            <Textarea
              id="approve-comment"
              placeholder="Añade notas sobre esta aprobación..."
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onApprove(requestId, approveComment || undefined);
                setApproveComment("");
              }}
              className="bg-income text-income-foreground hover:bg-income/90"
            >
              Aprobar Solicitud
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild={true}>
          <Button
            size="sm"
            variant="outline"
            className="border-expense text-expense hover:bg-expense hover:text-expense-foreground"
            disabled={disabled}
          >
            <XCircle className="mr-1.5 size-4" />
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta solicitud de fondos? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-comment" className="text-sm font-medium">
              Razón del rechazo (opcional)
            </Label>
            <Textarea
              id="reject-comment"
              placeholder="Proporciona una razón para rechazar esta solicitud..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReject(requestId, rejectComment || undefined);
                setRejectComment("");
              }}
              className="bg-expense text-expense-foreground hover:bg-expense/90"
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
