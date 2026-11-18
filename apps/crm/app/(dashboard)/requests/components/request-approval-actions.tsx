"use client";

import { Check, X } from "lucide-react";
import { useId, useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";

interface RequestApprovalActionsProps {
  requestId: string;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment?: string) => void;
  className?: string;
}

export function RequestApprovalActions({
  requestId,
  onApprove,
  onReject,
  className,
}: RequestApprovalActionsProps) {
  const [comment, setComment] = useState("");
  const fieldId = useId();
  const requestApprovalActionsRequestsPage = {
    container: cn("flex flex-col gap-4", className),
    field: cn("flex w-full flex-col gap-[7px]"),
    label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
    textarea: cn(
      "min-h-[88px] resize-none rounded-2xl bg-card px-4 py-3.5 text-sm outline-none",
      "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] placeholder:text-[var(--tinta-apagada)]",
      "focus-visible:shadow-[inset_0_0_0_1.5px_var(--granada),0_0_0_4px_var(--granada-100)]",
    ),
    buttons: cn("flex gap-2.5"),
    approve: cn("flex-1"),
    icon: cn("size-4"),
  };

  const decide = (action: (id: string, text?: string) => void) => () => {
    action(requestId, comment.trim() || undefined);
    setComment("");
  };

  return (
    <div className={requestApprovalActionsRequestsPage.container}>
      <div className={requestApprovalActionsRequestsPage.field}>
        <label className={requestApprovalActionsRequestsPage.label} htmlFor={fieldId}>
          Comentario para el líder
        </label>
        <textarea
          className={requestApprovalActionsRequestsPage.textarea}
          id={fieldId}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Escribe una respuesta…"
          value={comment}
        />
      </div>
      <div className={requestApprovalActionsRequestsPage.buttons}>
        <BoardButton onClick={decide(onReject)} variant="outline">
          <X aria-hidden="true" className={requestApprovalActionsRequestsPage.icon} />
          Rechazar
        </BoardButton>
        <BoardButton
          className={requestApprovalActionsRequestsPage.approve}
          onClick={decide(onApprove)}
          variant="primary"
        >
          <Check aria-hidden="true" className={requestApprovalActionsRequestsPage.icon} />
          Aprobar solicitud
        </BoardButton>
      </div>
    </div>
  );
}
