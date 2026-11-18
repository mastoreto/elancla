import { CircleAlert, Eye, FileText, PencilLine, Trash2 } from "lucide-react";
import type { Receipt } from "@/app/(dashboard)/receipts/types/index";
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

const receiptsTableReceiptsPage = {
  empty: cn(
    "flex min-h-56 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 text-center",
  ),
};

interface ReceiptsTableProps {
  receipts: Receipt[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onView?: (receipt: Receipt) => void;
  onEdit?: (receipt: Receipt) => void;
  onDelete?: (receipt: Receipt) => void;
}

const loadingRowIds = [
  "receipt-loading-row-1",
  "receipt-loading-row-2",
  "receipt-loading-row-3",
  "receipt-loading-row-4",
];

function formatCurrency(currency: Receipt["currency"], amount: number) {
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

export function ReceiptsTable({
  receipts,
  isLoading = false,
  errorMessage,
  onView,
  onEdit,
  onDelete,
}: ReceiptsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de boletas</CardTitle>
        <CardDescription>
          Visualiza comprobantes de gasto asociados a movimientos o solicitudes aprobadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage ? (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>Ocurrió un error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {!errorMessage && isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Relacionado a</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRowIds.map((rowId) => (
                <TableRow key={rowId}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Skeleton className="h-5 w-36" />
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
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-18" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}

        {!errorMessage && !isLoading && receipts.length === 0 ? (
          <div className={receiptsTableReceiptsPage.empty}>
            <p className="text-muted-foreground text-sm">No hay boletas registradas</p>
          </div>
        ) : null}

        {!errorMessage && !isLoading && receipts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Relacionado a</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.number}</TableCell>
                  <TableCell className="whitespace-normal">{receipt.provider}</TableCell>
                  <TableCell>{formatCurrency(receipt.currency, receipt.amount)}</TableCell>
                  <TableCell>{receipt.currency}</TableCell>
                  <TableCell>{formatDate(receipt.date)}</TableCell>
                  <TableCell className="max-w-72 whitespace-normal">
                    {receipt.relatedEntity}
                  </TableCell>
                  <TableCell>
                    {receipt.fileUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-1"
                        onClick={() => onView?.(receipt)}
                      >
                        <FileText className="size-4" />
                        Ver archivo
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">Sin archivo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onView?.(receipt)}
                      >
                        <Eye className="size-4" />
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(receipt)}
                      >
                        <PencilLine className="size-4" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete?.(receipt)}
                      >
                        <Trash2 className="size-4" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
