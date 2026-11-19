"use client";

import type { Permission } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import { BarChart3, CircleDollarSign, Plus, Upload } from "lucide-react";
import type { ComponentType } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { useAccess } from "@/lib/authz/AccessProvider";
import { filterByPermission } from "@/lib/authz/filterByPermission";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const quickActionsCardDashboardPage = {
  // Two columns when there is more than one button; a lone odd one spans the row.
  grid: cn(
    "grid grid-cols-1 gap-2.5 sm:grid-cols-2",
    "[&>*:last-child:nth-child(odd)]:sm:col-span-2",
  ),
  gridSingle: cn("grid grid-cols-1 gap-2.5"),
  action: cn("w-full"),
  icon: cn("size-[17px]"),
};

interface QuickAction {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  requires: readonly Permission[];
  primary?: boolean;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    label: "Nuevo movimiento",
    href: getChurchRoutePath("movements"),
    icon: Plus,
    requires: [PERMISSIONS.movements.create],
    primary: true,
  },
  {
    label: "Nueva solicitud",
    href: getChurchRoutePath("requests"),
    icon: CircleDollarSign,
    requires: [PERMISSIONS.requests.create],
  },
  {
    label: "Subir boleta",
    href: getChurchRoutePath("receipts"),
    icon: Upload,
    requires: [PERMISSIONS.vouchers.create],
  },
  {
    label: "Crear informe",
    href: getChurchRoutePath("reports"),
    icon: BarChart3,
    requires: [PERMISSIONS.reports.create],
  },
];

/** Renders nothing when the person's roles allow none of the quick actions. */
export function QuickActionsCard() {
  const actions = filterByPermission(QUICK_ACTIONS, useAccess());
  if (actions.length === 0) return null;

  return (
    <BoardCard>
      <BoardCardHeader title="Acciones rápidas" />
      <div
        className={
          actions.length === 1
            ? quickActionsCardDashboardPage.gridSingle
            : quickActionsCardDashboardPage.grid
        }
      >
        {actions.map((action) => (
          <BoardButton
            className={quickActionsCardDashboardPage.action}
            href={action.href}
            key={action.label}
            variant={action.primary ? "primary" : undefined}
          >
            <action.icon aria-hidden={true} className={quickActionsCardDashboardPage.icon} />
            {action.label}
          </BoardButton>
        ))}
      </div>
    </BoardCard>
  );
}
