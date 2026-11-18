import { CircleAlert, Eye, FileText, PencilLine, Trash2 } from "lucide-react";
import type { Voucher } from "@/app/(dashboard)/vouchers/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const vouchersTableVouchersPage = {
  card: cn("rounded-xl border bg-card p-4 shadow-xs"),
  responsibleCard: cn("rounded-lg bg-muted/30 p-3 sm:col-span-2"),
  empty: cn(
    "flex min-h-56 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 text-center",
  ),
  amountBadge: cn("rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"),
  termLabel: cn("text-muted-foreground text-xs uppercase tracking-wide"),
};

interface VouchersTableProps {
  vouchers: Voucher[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onView?: (voucher: Voucher) => void;
  onEdit?: (voucher: Voucher) => void;
  onDelete?: (voucher: Voucher) => void;
}

const tableColumns = [
  "Descripción",
  "Monto",
  "Moneda",
  "Fecha",
  "Responsable",
  "Relacionado a",
  "Acciones",
] as const;

const loadingRowIds = [
  "voucher-loading-row-1",
  "voucher-loading-row-2",
  "voucher-loading-row-3",
  "voucher-loading-row-4",
];

const loadingCardIds = [
  "voucher-loading-card-1",
  "voucher-loading-card-2",
  "voucher-loading-card-3",
];

function formatCurrency(currency: Voucher["currency"], amount: number) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function VoucherActions({
  voucher,
  onView,
  onEdit,
  onDelete,
}: Pick<VouchersTableProps, "onView" | "onEdit" | "onDelete"> & {
  voucher: Voucher;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Ver comprobante ${voucher.description}`}
        onClick={() => onView?.(voucher)}
      >
        <Eye className="size-4" />
        Ver
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Editar comprobante ${voucher.description}`}
        onClick={() => onEdit?.(voucher)}
      >
        <PencilLine className="size-4" />
        Editar
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        aria-label={`Eliminar comprobante ${voucher.description}`}
        onClick={() => onDelete?.(voucher)}
      >
        <Trash2 className="size-4" />
        Eliminar
      </Button>
    </div>
  );
}

function TableColumns() {
  return (
    <TableHeader>
      <TableRow>
        {tableColumns.map((column) => (
          <TableHead key={column}>{column}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function LoadingTable() {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableColumns />
        <TableBody>
          {loadingRowIds.map((rowId) => (
            <TableRow key={rowId}>
              <TableCell className="whitespace-normal">
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-28" />
              </TableCell>
              <TableCell className="whitespace-normal">
                <Skeleton className="h-5 w-36" />
              </TableCell>
              <TableCell className="whitespace-normal">
                <Skeleton className="h-5 w-48" />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="space-y-3 md:hidden">
      {loadingCardIds.map((cardId) => (
        <div key={cardId} className="space-y-4 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={vouchersTableVouchersPage.empty}>
      <p className="text-muted-foreground text-sm">No hay comprobantes registrados</p>
    </div>
  );
}

export function VouchersTable({
  vouchers,
  isLoading = false,
  errorMessage,
  onView,
  onEdit,
  onDelete,
}: VouchersTableProps) {
  const hasError = Boolean(errorMessage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de comprobantes</CardTitle>
        <CardDescription>
          Visualiza justificativos manuales asociados a movimientos o solicitudes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasError ? (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>Ocurrió un error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {!hasError && isLoading ? (
          <>
            <LoadingCards />
            <LoadingTable />
          </>
        ) : null}

        {!hasError && !isLoading && vouchers.length === 0 ? <EmptyState /> : null}

        {!hasError && !isLoading && vouchers.length > 0 ? (
          <>
            <div className="space-y-3 md:hidden">
              {vouchers.map((voucher) => (
                <article key={voucher.id} className={vouchersTableVouchersPage.card}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{voucher.description}</h3>
                      <p className="text-muted-foreground text-sm">{voucher.relatedEntity}</p>
                    </div>
                    <div className={vouchersTableVouchersPage.amountBadge}>{voucher.currency}</div>
                  </div>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/30 p-3">
                      <dt className={vouchersTableVouchersPage.termLabel}>Monto</dt>
                      <dd className="mt-1 font-medium">
                        {formatCurrency(voucher.currency, voucher.amount)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                      <dt className={vouchersTableVouchersPage.termLabel}>Fecha</dt>
                      <dd className="mt-1 font-medium">{formatDate(voucher.date)}</dd>
                    </div>
                    <div className={vouchersTableVouchersPage.responsibleCard}>
                      <dt className={vouchersTableVouchersPage.termLabel}>Responsable</dt>
                      <dd className="mt-1 font-medium">{voucher.responsible}</dd>
                    </div>
                  </dl>

                  <div className="mt-4">
                    <VoucherActions
                      voucher={voucher}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableColumns />
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="max-w-80 whitespace-normal font-medium">
                        {voucher.description}
                      </TableCell>
                      <TableCell>{formatCurrency(voucher.currency, voucher.amount)}</TableCell>
                      <TableCell>{voucher.currency}</TableCell>
                      <TableCell>{formatDate(voucher.date)}</TableCell>
                      <TableCell className="whitespace-normal">{voucher.responsible}</TableCell>
                      <TableCell className="max-w-72 whitespace-normal">
                        {voucher.relatedEntity}
                      </TableCell>
                      <TableCell>
                        <VoucherActions
                          voucher={voucher}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
