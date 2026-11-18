import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import type { MoneyRequest } from "@/lib/types";
import { DashboardCard, DashboardCardHeader } from "@/src/componentes/dashboard";
import { formatCurrency, formatShortDate } from "./dashboard-formatters";

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
            className="hidden items-center gap-1.5 text-xs font-semibold text-[var(--tinta-suave)] transition hover:text-primary sm:inline-flex"
            href={getChurchRoutePath("requests")}
          >
            Revisar
            <ArrowRight className="size-3" />
          </Link>
        }
        subtitle={`${pendingRequests.length} esperando decisión`}
        title="Solicitudes pendientes"
      />

      {pendingRequests.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {pendingRequests.map((request) => (
            <article
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto]"
              key={request.id}
            >
              <span className="mt-1 flex size-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <Clock3 className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {request.concept}
                </div>
                <div className="mt-1 text-[11.5px] text-muted-foreground">
                  {request.ministry} · {request.leader} · {formatShortDate(request.date)}
                </div>
              </div>
              <div className="col-start-2 font-mono text-xs font-semibold text-foreground tabular-nums sm:col-auto">
                {formatCurrency(request.amount, request.currency)}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--bruma)] text-center">
          <CheckCircle2 className="mb-3 size-9 text-emerald-600" />
          <h3 className="text-sm font-semibold text-foreground">Sin pendientes</h3>
          <p className="mt-1 max-w-56 text-xs text-muted-foreground">
            Todas las solicitudes de fondos ya fueron procesadas.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
