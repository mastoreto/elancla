import { Landmark, MoreHorizontal, Pencil, Trash2, WalletCards } from "lucide-react";
import type { BankAccountSetting } from "@/app/(dashboard)/settings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SettingsSectionShell } from "./settings-section-shell";

interface BankAccountsPanelProps {
  accounts: BankAccountSetting[];
}

const bankAccountsPanelSettingsPage = {
  block: cn("grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]"),
  blockBorder: cn("rounded-lg border border-border bg-card overflow-hidden"),
  text: cn("text-muted-foreground text-xs uppercase tracking-wide"),
};

function getStatusBadgeClass(status: BankAccountSetting["status"]) {
  if (status === "Principal") {
    return "bg-secondary text-secondary-foreground";
  }

  if (status === "Activa") {
    return "bg-success-surface text-income";
  }

  return "bg-warning-surface text-warning";
}

function AccountRowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil className="size-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 className="size-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BankAccountsPanel({ accounts }: BankAccountsPanelProps) {
  const primaryAccount = accounts.find((account) => account.status === "Principal") ?? null;
  const pendingReconciliationCount = accounts.filter(
    (account) => account.status === "En conciliación",
  ).length;

  return (
    <div className={bankAccountsPanelSettingsPage.block}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">Cuentas Bancarias</h2>
            <p className="text-sm text-muted-foreground">
              Mantén visibles las cuentas habilitadas para ingresos, egresos y conciliación.
            </p>
          </div>
          <Button type="button" size="sm">
            <Landmark className="size-4" />
            Nueva cuenta
          </Button>
        </div>

        <div className={bankAccountsPanelSettingsPage.blockBorder}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Alias</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.alias}</TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell className="whitespace-normal">{account.owner}</TableCell>
                  <TableCell>{account.branch}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(account.status)}>{account.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <AccountRowActions />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-6">
        <SettingsSectionShell
          title="Resumen bancario"
          description="Indicadores rápidos para la operación diaria."
          contentClassName="space-y-4"
        >
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <WalletCards className="size-4 text-primary" />
              Cuenta principal
            </div>
            <p className="text-sm font-medium">{primaryAccount?.alias ?? "Sin definir"}</p>
            <p className="text-muted-foreground text-sm">
              {primaryAccount?.bankName ??
                "Configura una cuenta principal para centralizar movimientos."}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className={bankAccountsPanelSettingsPage.text}>Cuentas en conciliación</p>
            <p className="mt-2 text-2xl font-semibold">{pendingReconciliationCount}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Requieren seguimiento antes del cierre del período.
            </p>
          </div>
        </SettingsSectionShell>
      </div>
    </div>
  );
}
