import {
  actionsOf,
  isDangerousPermission,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  type PermissionAction,
  type PermissionResource,
  type PermissionScope,
  scopesOf,
} from "@ancla/contracts";
import {
  ArrowLeftRight,
  BarChart3,
  CircleDollarSign,
  Folder,
  HeartHandshake,
  type LucideIcon,
  Mail,
  Newspaper,
  PiggyBank,
  Receipt,
  Shield,
  SquareCheck,
  Sun,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_RESOURCE_INFO,
  PERMISSION_SCOPE_LABELS,
} from "../data/permission-labels";
import type { PermissionGrid } from "../types";
import { isResourceFull, scopeOfCell } from "../utils";
import { SettingsCheck } from "./settings-check";
import { SettingsToggle } from "./settings-toggle";

const RESOURCE_ICONS: Record<PermissionResource, LucideIcon> = {
  movements: ArrowLeftRight,
  requests: CircleDollarSign,
  vouchers: Receipt,
  projects: Folder,
  budgets: PiggyBank,
  voting: SquareCheck,
  reports: BarChart3,
  content: Newspaper,
  "ministries.profile": HeartHandshake,
  "ministries.finance": Wallet,
  users: Users,
  roles: Shield,
  invitations: Mail,
  settings: Sun,
};

const COLUMNS =
  "grid-cols-[minmax(170px,1fr)_repeat(5,minmax(78px,1fr))_70px] sm:grid-cols-[1.2fr_repeat(5,1fr)_90px]";

const permissionMatrixSettingsPage = {
  scroller: cn("overflow-x-auto"),
  table: cn("min-w-[760px]"),
  head: cn(
    "grid gap-2 rounded-[14px] bg-secondary px-4 py-3 text-xs font-bold text-[var(--tinta-suave)]",
    COLUMNS,
  ),
  center: cn("text-center"),
  row: cn("grid items-center gap-2 border-b border-border px-4 py-2.5", COLUMNS),
  resource: cn("flex items-center gap-3"),
  bubble: cn("size-[34px]"),
  resourceIcon: cn("size-4"),
  resourceText: cn("flex min-w-0 flex-col gap-0.5"),
  resourceName: cn("text-sm font-bold"),
  resourceHint: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  cell: cn("flex flex-col items-center justify-center gap-1"),
  unsupported: cn("text-[var(--tinta-apagada)]"),
  scope: cn(
    "h-6 max-w-full rounded-full bg-secondary px-1.5 text-[11px] font-semibold text-[var(--tinta-suave)]",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.12)] focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-70",
  ),
  danger: cn("size-3.5 text-[var(--oro-texto)]"),
  dangerBadge: cn("inline-flex"),
  dangerCell: cn(
    "rounded-[10px] bg-[var(--oro-50)] px-1.5 py-1 shadow-[inset_0_0_0_1px_var(--oro-100)]",
  ),
};

interface PermissionMatrixProps {
  grid: PermissionGrid;
  onToggleAction: (resource: PermissionResource, action: PermissionAction) => void;
  onToggleResource: (resource: PermissionResource) => void;
  onChangeScope: (
    resource: PermissionResource,
    action: PermissionAction,
    scope: PermissionScope,
  ) => void;
  readOnly?: boolean;
}

/** Resource x action grid; every granted cell carries its own scope (own, ministry or all). */
export function PermissionMatrix({
  grid,
  onToggleAction,
  onToggleResource,
  onChangeScope,
  readOnly = false,
}: PermissionMatrixProps) {
  return (
    <div className={permissionMatrixSettingsPage.scroller}>
      <div className={permissionMatrixSettingsPage.table}>
        <div className={permissionMatrixSettingsPage.head}>
          <span>Recurso</span>
          {PERMISSION_ACTIONS.map((action) => (
            <span className={permissionMatrixSettingsPage.center} key={action}>
              {PERMISSION_ACTION_LABELS[action]}
            </span>
          ))}
          <span className={permissionMatrixSettingsPage.center}>Todo</span>
        </div>
        {PERMISSION_RESOURCES.map((resource) => {
          const Icon = RESOURCE_ICONS[resource];
          const info = PERMISSION_RESOURCE_INFO[resource];
          const supportedActions = actionsOf(resource);
          const scopes = scopesOf(resource);
          return (
            <div className={permissionMatrixSettingsPage.row} key={resource}>
              <div className={permissionMatrixSettingsPage.resource}>
                <IconBubble className={permissionMatrixSettingsPage.bubble} tone="ink">
                  <Icon aria-hidden="true" className={permissionMatrixSettingsPage.resourceIcon} />
                </IconBubble>
                <div className={permissionMatrixSettingsPage.resourceText}>
                  <span className={permissionMatrixSettingsPage.resourceName}>{info.label}</span>
                  <span className={permissionMatrixSettingsPage.resourceHint}>{info.hint}</span>
                </div>
              </div>
              {PERMISSION_ACTIONS.map((action) => {
                if (!supportedActions.includes(action)) {
                  return (
                    <div className={permissionMatrixSettingsPage.cell} key={action}>
                      <span aria-hidden="true" className={permissionMatrixSettingsPage.unsupported}>
                        —
                      </span>
                    </div>
                  );
                }
                const scope = scopeOfCell(grid, resource, action);
                const cellLabel = `${info.label}: ${PERMISSION_ACTION_LABELS[action]}`;
                const dangerous = isDangerousPermission(resource, action);
                return (
                  <div
                    className={cn(
                      permissionMatrixSettingsPage.cell,
                      dangerous && scope && permissionMatrixSettingsPage.dangerCell,
                    )}
                    key={action}
                  >
                    <SettingsCheck
                      checked={scope !== undefined}
                      disabled={readOnly}
                      label={cellLabel}
                      onCheckedChange={() => onToggleAction(resource, action)}
                    />
                    {dangerous && scope ? (
                      <span
                        className={permissionMatrixSettingsPage.dangerBadge}
                        title="Permiso peligroso: permite controlar accesos"
                      >
                        <TriangleAlert
                          aria-hidden="true"
                          className={permissionMatrixSettingsPage.danger}
                        />
                        <span className="sr-only">Permiso peligroso</span>
                      </span>
                    ) : null}
                    {scope && scopes.length > 1 ? (
                      <select
                        aria-label={`Alcance de ${cellLabel}`}
                        className={permissionMatrixSettingsPage.scope}
                        disabled={readOnly}
                        onChange={(event) =>
                          onChangeScope(resource, action, event.target.value as PermissionScope)
                        }
                        value={scope}
                      >
                        {scopes.map((option) => (
                          <option key={option} value={option}>
                            {PERMISSION_SCOPE_LABELS[option]}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                );
              })}
              <div className={permissionMatrixSettingsPage.cell}>
                <SettingsToggle
                  checked={isResourceFull(grid, resource)}
                  disabled={readOnly}
                  label={`${info.label}: todo`}
                  onCheckedChange={() => onToggleResource(resource)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
