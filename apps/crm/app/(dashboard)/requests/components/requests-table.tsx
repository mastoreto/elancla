"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Eye, X } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { BoardPagination } from "@/components/dashboard/board/board-pagination";
import type { StatusPillTone } from "@/components/dashboard/board/status-pill";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import type { MoneyRequest, RequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatRequestAmount, getInitials, REQUESTS_PAGE_SIZE } from "../utils";

interface RequestsTableProps {
  requests: MoneyRequest[];
  selectedId: string | null;
  total: number;
  page: number;
  pageCount: number;
  canDecide: boolean;
  onPageChange: (page: number) => void;
  onSelect: (request: MoneyRequest) => void;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const STATUS_PILL: Record<RequestStatus, { tone: StatusPillTone; label: string }> = {
  pending: { tone: "gold", label: "Pendiente" },
  approved: { tone: "green", label: "Aprobada" },
  rejected: { tone: "rose", label: "Rechazada" },
};

const AVATAR_TONES = [
  cn("bg-[linear-gradient(150deg,#ffe3e7,#f6b9c3)] text-primary"),
  cn("bg-(image:--grad-avatar) text-[var(--oro-texto)]"),
  cn("bg-[linear-gradient(150deg,#dcf3e5,#b3dfc4)] text-[var(--vida)]"),
] satisfies string[];

const GRID = cn(
  "sm:grid sm:grid-cols-[70px_1.8fr_1fr_1.3fr_110px_120px_90px] sm:items-center sm:gap-3.5 sm:px-[18px]",
);

const requestsTableRequestsPage = {
  card: cn("flex flex-col gap-1 p-5"),
  head: cn(
    GRID,
    "hidden rounded-[14px] bg-secondary py-3 text-xs font-bold text-[var(--tinta-suave)]",
  ),
  list: cn("flex flex-col gap-1"),
  row: cn(
    GRID,
    "relative flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border-b border-border/60 px-4 py-[13px] text-sm",
  ),
  rowSelected: cn("border-b-0 bg-(--granada-50)"),
  date: cn("text-[var(--tinta-suave)]"),
  concept: cn(
    "min-w-0 text-left font-bold after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring",
  ),
  ministry: cn("text-[var(--tinta-suave)]"),
  leader: cn("flex min-w-0 items-center gap-2.5"),
  avatar: cn(
    "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-[0_0_0_2px_#fff]",
  ),
  leaderName: cn("min-w-0 font-medium"),
  amount: cn("font-bold whitespace-nowrap tabular-nums"),
  actions: cn("relative z-10 flex justify-end gap-1.5"),
  action: cn(
    "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-(--granada-50)",
  ),
  actionIcon: cn("size-4"),
  empty: cn("py-10 text-center text-sm text-[var(--tinta-apagada)]"),
};

export function RequestsTable({
  requests,
  selectedId,
  total,
  page,
  pageCount,
  canDecide,
  onPageChange,
  onSelect,
  onApprove,
  onReject,
}: RequestsTableProps) {
  return (
    <BoardCard className={requestsTableRequestsPage.card}>
      <div aria-hidden="true" className={requestsTableRequestsPage.head}>
        <span>Fecha</span>
        <span>Concepto</span>
        <span>Ministerio</span>
        <span>Líder</span>
        <span>Monto</span>
        <span>Estado</span>
        <span />
      </div>

      {requests.length === 0 ? (
        <p className={requestsTableRequestsPage.empty}>No se encontraron solicitudes.</p>
      ) : (
        <ul className={requestsTableRequestsPage.list}>
          {requests.map((request, index) => {
            const pill = STATUS_PILL[request.status];
            return (
              <li
                className={cn(
                  requestsTableRequestsPage.row,
                  request.id === selectedId && requestsTableRequestsPage.rowSelected,
                )}
                key={request.id}
              >
                <span className={requestsTableRequestsPage.date}>
                  {format(new Date(request.date), "d MMM", { locale: es })}
                </span>
                <button
                  className={requestsTableRequestsPage.concept}
                  onClick={() => onSelect(request)}
                  type="button"
                >
                  {request.concept}
                </button>
                <span className={requestsTableRequestsPage.ministry}>{request.ministry}</span>
                <span className={requestsTableRequestsPage.leader}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      requestsTableRequestsPage.avatar,
                      AVATAR_TONES[index % AVATAR_TONES.length],
                    )}
                  >
                    {getInitials(request.leader)}
                  </span>
                  <span className={requestsTableRequestsPage.leaderName}>{request.leader}</span>
                </span>
                <b className={requestsTableRequestsPage.amount}>
                  {formatRequestAmount(request.amount, request.currency)}
                </b>
                <span>
                  <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
                </span>
                <span className={requestsTableRequestsPage.actions}>
                  {request.status === "pending" && canDecide ? (
                    <>
                      <button
                        aria-label={`Aprobar ${request.concept}`}
                        className={requestsTableRequestsPage.action}
                        onClick={() => onApprove(request.id)}
                        type="button"
                      >
                        <Check
                          aria-hidden="true"
                          className={requestsTableRequestsPage.actionIcon}
                        />
                      </button>
                      <button
                        aria-label={`Rechazar ${request.concept}`}
                        className={requestsTableRequestsPage.action}
                        onClick={() => onReject(request.id)}
                        type="button"
                      >
                        <X aria-hidden="true" className={requestsTableRequestsPage.actionIcon} />
                      </button>
                    </>
                  ) : (
                    <button
                      aria-label={`Ver detalle de ${request.concept}`}
                      className={requestsTableRequestsPage.action}
                      onClick={() => onSelect(request)}
                      type="button"
                    >
                      <Eye aria-hidden="true" className={requestsTableRequestsPage.actionIcon} />
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <BoardPagination
        onPageChange={onPageChange}
        page={page}
        pageCount={pageCount}
        pageSize={REQUESTS_PAGE_SIZE}
        total={total}
      />
    </BoardCard>
  );
}
