import { Coins, Plus } from "lucide-react";
import type { CurrencySetting } from "@/app/(dashboard)/settings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsSectionShell } from "./settings-section-shell";

interface CurrenciesPanelProps {
  currencies: CurrencySetting[];
}

function getStatusBadgeClass(status: CurrencySetting["status"]) {
  if (status === "Base") {
    return "bg-secondary text-secondary-foreground";
  }

  return "bg-secondary text-secondary-foreground";
}

export function CurrenciesPanel({ currencies }: CurrenciesPanelProps) {
  return (
    <SettingsSectionShell
      title="Monedas"
      description="Configura monedas disponibles, equivalencias de referencia y reglas de redondeo."
      action={
        <Button type="button" size="sm">
          <Plus className="size-4" />
          Nueva moneda
        </Button>
      }
      contentClassName="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
    >
      {currencies.map((currency) => (
        <article
          key={currency.code}
          className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Coins className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold">{currency.code}</h3>
                  <p className="text-muted-foreground text-sm">{currency.name}</p>
                </div>
              </div>
            </div>
            <Badge className={getStatusBadgeClass(currency.status)}>{currency.status}</Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/20 p-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Símbolo</p>
              <p className="mt-1 font-medium">{currency.symbol}</p>
            </div>
            <div className="rounded-xl bg-muted/20 p-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Cotización</p>
              <p className="mt-1 font-medium">{currency.exchangeRate}</p>
            </div>
            <div className="rounded-xl bg-muted/20 p-3 sm:col-span-2">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Redondeo</p>
              <p className="mt-1 font-medium">{currency.rounding}</p>
            </div>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            Actualizado por última vez: {currency.updatedAt}
          </p>
        </article>
      ))}
    </SettingsSectionShell>
  );
}
