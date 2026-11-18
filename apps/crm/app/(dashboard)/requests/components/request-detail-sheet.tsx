"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CircleDollarSign, X } from "lucide-react";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { ministries } from "@/lib/data";
import type { MoneyRequest, RequestStatus } from "@/lib/types";
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

const STATUS_PILL = {
  pending: { tone: "gold", label: "Pendiente" },
  approved: { tone: "green", label: "Aprobada" },
  rejected: { tone: "rose", label: "Rechazada" },
} as const satisfies Record<RequestStatus, { tone: "gold" | "green" | "rose"; label: string }>;

const requestDetailSheetRequestsPage = {
  content: cn(
    "inset-y-2.5 h-auto w-full gap-4 overflow-y-auto rounded-l-[34px] border-0 bg-card p-7",
    "shadow-[0_30px_60px_-30px_rgba(60,20,30,0.45)] sm:max-w-[440px] [&>button]:hidden",
  ),
  header: cn("flex items-center gap-3"),
  headerBubble: cn("size-[46px]"),
  headerIcon: cn("size-5"),
  headerText: cn("flex flex-1 flex-col"),
  title: cn("font-display text-[21px] leading-tight font-medium"),
  subtitle: cn("text-[13px] text-[var(--tinta-apagada)]"),
  close: cn(
    "inline-flex size-[38px] shrink-0 items-center justify-center rounded-full bg-secondary text-foreground",
  ),
  pill: cn("self-start"),
  facts: cn("flex flex-col"),
  fact: cn("flex justify-between gap-3 border-b border-border/60 py-[11px] text-sm"),
  factLabel: cn("text-[var(--tinta-apagada)]"),
  factValue: cn("text-right font-bold"),
  description: cn(
    "rounded-[20px] bg-secondary px-4 py-3.5 text-[13.5px] leading-[1.55] text-[var(--tinta-suave)]",
  ),
  sectionTitle: cn("font-display text-lg font-medium"),
};

export function RequestDetailSheet({
  request,
  canDecide,
  onClose,
  onApprove,
  onReject,
}: RequestDetailSheetProps) {
  const ministry = ministries.find((item) => item.name === request?.ministry);

  return (
    <Sheet onOpenChange={(open) => (open ? undefined : onClose())} open={request !== null}>
      <SheetContent className={requestDetailSheetRequestsPage.content}>
        {request ? (
          <>
            <div className={requestDetailSheetRequestsPage.header}>
              <IconBubble className={requestDetailSheetRequestsPage.headerBubble} tone="gold">
                <CircleDollarSign
                  aria-hidden="true"
                  className={requestDetailSheetRequestsPage.headerIcon}
                />
              </IconBubble>
              <div className={requestDetailSheetRequestsPage.headerText}>
                <SheetTitle className={requestDetailSheetRequestsPage.title}>
                  {request.concept}
                </SheetTitle>
                <SheetDescription className={requestDetailSheetRequestsPage.subtitle}>
                  Solicitud · {format(new Date(request.date), "d MMM yyyy", { locale: es })}
                </SheetDescription>
              </div>
              <SheetClose aria-label="Cerrar" className={requestDetailSheetRequestsPage.close}>
                <X aria-hidden="true" className="size-4" />
              </SheetClose>
            </div>

            <StatusPill
              className={requestDetailSheetRequestsPage.pill}
              tone={STATUS_PILL[request.status].tone}
            >
              {STATUS_PILL[request.status].label}
            </StatusPill>

            <dl className={requestDetailSheetRequestsPage.facts}>
              <Fact label="Ministerio" value={request.ministry} />
              <Fact label="Líder" value={request.leader} />
              <Fact label="Monto" value={formatRequestAmount(request.amount, request.currency)} />
              {ministry ? (
                <Fact
                  label="Presupuesto del ministerio"
                  value={formatRequestAmount(ministry.budget, ministry.budgetCurrency)}
                />
              ) : null}
            </dl>

            {request.description ? (
              <p className={requestDetailSheetRequestsPage.description}>{request.description}</p>
            ) : null}

            <h3 className={requestDetailSheetRequestsPage.sectionTitle}>Historial</h3>
            <RequestTimeline timeline={request.timeline} />

            {request.status === "pending" && canDecide ? (
              <RequestApprovalActions
                onApprove={onApprove}
                onReject={onReject}
                requestId={request.id}
              />
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={requestDetailSheetRequestsPage.fact}>
      <dt className={requestDetailSheetRequestsPage.factLabel}>{label}</dt>
      <dd className={requestDetailSheetRequestsPage.factValue}>{value}</dd>
    </div>
  );
}
