import {
  ArrowLeftRight,
  BarChart3,
  CircleDollarSign,
  Folder,
  type LucideIcon,
  Newspaper,
  PiggyBank,
  Receipt,
  SquareCheck,
  Sun,
} from "lucide-react";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "../data/permission-modules";
import type { PermissionActionId, PermissionGrid, PermissionModuleId } from "../types";
import { hasAction, isModuleFull } from "../utils";
import { SettingsCheck } from "./settings-check";
import { SettingsToggle } from "./settings-toggle";

const MODULE_ICONS: Record<PermissionModuleId, LucideIcon> = {
  movements: ArrowLeftRight,
  requests: CircleDollarSign,
  vouchers: Receipt,
  projects: Folder,
  budgets: PiggyBank,
  voting: SquareCheck,
  reports: BarChart3,
  content: Newspaper,
  settings: Sun,
};

const COLUMNS =
  "grid-cols-[minmax(160px,1fr)_repeat(5,60px)_70px] sm:grid-cols-[1fr_repeat(5,84px)_90px]";

const permissionMatrixSettingsPage = {
  scroller: cn("overflow-x-auto"),
  table: cn("min-w-[640px]"),
  head: cn(
    "grid gap-2 rounded-[14px] bg-secondary px-4 py-3 text-xs font-bold text-[var(--tinta-suave)]",
    COLUMNS,
  ),
  center: cn("text-center"),
  row: cn("grid items-center gap-2 border-b border-border px-4 py-2.5", COLUMNS),
  module: cn("flex items-center gap-3"),
  bubble: cn("size-[34px]"),
  moduleIcon: cn("size-4"),
  moduleText: cn("flex min-w-0 flex-col gap-0.5"),
  moduleName: cn("text-sm font-bold"),
  moduleHint: cn("text-[12.5px] text-[var(--tinta-apagada)]"),
  cell: cn("flex justify-center"),
};

interface PermissionMatrixProps {
  grid: PermissionGrid;
  onToggleAction: (module: PermissionModuleId, action: PermissionActionId) => void;
  onToggleModule: (module: PermissionModuleId) => void;
}

export function PermissionMatrix({ grid, onToggleAction, onToggleModule }: PermissionMatrixProps) {
  return (
    <div className={permissionMatrixSettingsPage.scroller}>
      <div className={permissionMatrixSettingsPage.table}>
        <div className={permissionMatrixSettingsPage.head}>
          <span>Módulo</span>
          {PERMISSION_ACTIONS.map((action) => (
            <span className={permissionMatrixSettingsPage.center} key={action.id}>
              {action.label}
            </span>
          ))}
          <span className={permissionMatrixSettingsPage.center}>Todo</span>
        </div>
        {PERMISSION_MODULES.map((module) => {
          const Icon = MODULE_ICONS[module.id];
          return (
            <div className={permissionMatrixSettingsPage.row} key={module.id}>
              <div className={permissionMatrixSettingsPage.module}>
                <IconBubble className={permissionMatrixSettingsPage.bubble} tone="ink">
                  <Icon aria-hidden="true" className={permissionMatrixSettingsPage.moduleIcon} />
                </IconBubble>
                <div className={permissionMatrixSettingsPage.moduleText}>
                  <span className={permissionMatrixSettingsPage.moduleName}>{module.label}</span>
                  <span className={permissionMatrixSettingsPage.moduleHint}>{module.hint}</span>
                </div>
              </div>
              {PERMISSION_ACTIONS.map((action) => (
                <div className={permissionMatrixSettingsPage.cell} key={action.id}>
                  <SettingsCheck
                    checked={hasAction(grid, module.id, action.id)}
                    label={`${module.label}: ${action.label}`}
                    onCheckedChange={() => onToggleAction(module.id, action.id)}
                  />
                </div>
              ))}
              <div className={permissionMatrixSettingsPage.cell}>
                <SettingsToggle
                  checked={isModuleFull(grid, module.id)}
                  label={`${module.label}: todo`}
                  onCheckedChange={() => onToggleModule(module.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
