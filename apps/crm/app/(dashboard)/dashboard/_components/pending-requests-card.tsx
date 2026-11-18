import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import type { MoneyRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";
import { formatCurrency, formatShortDate } from "./dashboard-formatters";

const pendingRequestsCardDashboardPage = {
  link: cn(
    "hidden items-center gap-1.5 text-xs font-semibold text-tinta-suave transition hover:text-primary sm:inline-flex",
  ),
  linkIcon: cn("size-3"),
  list: cn("divide-y divide-border"),
  item: cn("grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto]"),
  itemIcon: cn(
    "mt-1 flex size-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary",
  ),
  itemIconGlyph: cn("size-4"),
  itemBody: cn("min-w-0"),
  itemConcept: cn("truncate text-sm font-semibold text-foreground"),
  itemMeta: cn("mt-1 text-[11.5px] text-muted-foreground"),
  itemAmount: cn(
    "col-start-2 font-mono text-xs font-semibold text-foreground tabular-nums sm:col-auto",
  ),
  empty: cn(
    "flex min-h-[190px] flex-col items-center justify-center rounded-[14px] border border-dashed border-border bg-bruma text-center",
  ),
  emptyIcon: cn("mb-3 size-9 text-income"),
  emptyTitle: cn("text-sm font-semibold text-foreground"),
  emptyText: cn("mt-1 max-w-56 text-xs text-muted-foreground"),
};

type PendingRequestsCardProps = {
  requests: MoneyRequest[];
};

export function PendingRequestsCard({ requests }: PendingRequestsCardProps) {
  const pendingRequests = requests.filter((request) => request.status === "pending").slice(0, 4);

  return (
    <DashboardCard>
      <DashboardCardHeader
        action={
          <Link
            className={pendingRequestsCardDashboardPage.link}
            href={getChurchRoutePath("requests")}
          >
            Revisar
            <ArrowRight className={pendingRequestsCardDashboardPage.linkIcon} />
          </Link>
        }
        subtitle={`${pendingRequests.length} esperando decisión`}
        title="Solicitudes pendientes"
      />

      {pendingRequests.length > 0 ? (
        <div className={pendingRequestsCardDashboardPage.list}>
          {pendingRequests.map((request) => (
            <article className={pendingRequestsCardDashboardPage.item} key={request.id}>
              <span className={pendingRequestsCardDashboardPage.itemIcon}>
                <Clock3 className={pendingRequestsCardDashboardPage.itemIconGlyph} />
              </span>
              <div className={pendingRequestsCardDashboardPage.itemBody}>
                <div className={pendingRequestsCardDashboardPage.itemConcept}>
                  {request.concept}
                </div>
                <div className={pendingRequestsCardDashboardPage.itemMeta}>
                  {request.ministry} · {request.leader} · {formatShortDate(request.date)}
                </div>
              </div>
              <div className={pendingRequestsCardDashboardPage.itemAmount}>
                {formatCurrency(request.amount, request.currency)}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={pendingRequestsCardDashboardPage.empty}>
          <CheckCircle2 className={pendingRequestsCardDashboardPage.emptyIcon} />
          <h3 className={pendingRequestsCardDashboardPage.emptyTitle}>Sin pendientes</h3>
          <p className={pendingRequestsCardDashboardPage.emptyText}>
            Todas las solicitudes de fondos ya fueron procesadas.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
