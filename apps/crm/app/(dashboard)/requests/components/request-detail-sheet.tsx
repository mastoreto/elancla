"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MoneyRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatRequestAmount } from "../utils";
import { RequestApprovalActions } from "./request-approval-actions";
import { RequestTimeline } from "./request-timeline";

interface RequestDetailSheetProps {
  request: MoneyRequest | null;
  canDecide: boolean;
  onClose: () => void;
  onApprove: (requestId: string, comment?: string) => void;
  onReject: (requestId: string, comment?: string) => void;
}

const requestDetailSheetRequestsPage = {
  content: cn("w-full gap-0 overflow-y-auto sm:max-w-md"),
  header: cn("border-b border-border p-6"),
  body: cn("flex flex-col gap-6 p-6"),
  amountCard: cn("flex items-center justify-between rounded-xl bg-bruma p-4"),
  amountLabel: cn("text-xs text-muted-foreground"),
  amount: cn("font-display text-2xl font-medium tabular-nums"),
  facts: cn("grid grid-cols-2 gap-4"),
  factLabel: cn("text-xs text-muted-foreground"),
  factValue: cn("text-sm font-medium"),
  sectionTitle: cn("mb-2 text-sm font-semibold"),
  description: cn("text-sm leading-6 text-muted-foreground"),
  footer: cn("border-t border-border pt-4"),
};

export function RequestDetailSheet({
  request,
  canDecide,
  onClose,
  onApprove,
  onReject,
}: RequestDetailSheetProps) {
  return (
    <Sheet onOpenChange={(open) => (open ? undefined : onClose())} open={request !== null}>
      <SheetContent className={requestDetailSheetRequestsPage.content}>
        {request ? (
          <>
            <SheetHeader className={requestDetailSheetRequestsPage.header}>
              <SheetTitle>{request.concept}</SheetTitle>
              <SheetDescription>
                Pedida por {request.leader} · {request.ministry}
              </SheetDescription>
            </SheetHeader>

            <div className={requestDetailSheetRequestsPage.body}>
              <div className={requestDetailSheetRequestsPage.amountCard}>
                <div>
                  <p className={requestDetailSheetRequestsPage.amountLabel}>Monto solicitado</p>
                  <p className={requestDetailSheetRequestsPage.amount}>
                    {formatRequestAmount(request.amount, request.currency)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <dl className={requestDetailSheetRequestsPage.facts}>
                <div>
                  <dt className={requestDetailSheetRequestsPage.factLabel}>Fecha</dt>
                  <dd className={requestDetailSheetRequestsPage.factValue}>
                    {format(new Date(request.date), "d 'de' MMMM yyyy", { locale: es })}
                  </dd>
                </div>
                <div>
                  <dt className={requestDetailSheetRequestsPage.factLabel}>Moneda</dt>
                  <dd className={requestDetailSheetRequestsPage.factValue}>{request.currency}</dd>
                </div>
              </dl>

              {request.description ? (
                <section>
                  <h3 className={requestDetailSheetRequestsPage.sectionTitle}>Descripción</h3>
                  <p className={requestDetailSheetRequestsPage.description}>
                    {request.description}
                  </p>
                </section>
              ) : null}

              <section>
                <h3 className={requestDetailSheetRequestsPage.sectionTitle}>Historial</h3>
                <RequestTimeline timeline={request.timeline} />
              </section>

              {request.status === "pending" && canDecide ? (
                <div className={requestDetailSheetRequestsPage.footer}>
                  <RequestApprovalActions
                    onApprove={onApprove}
                    onReject={onReject}
                    requestId={request.id}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
