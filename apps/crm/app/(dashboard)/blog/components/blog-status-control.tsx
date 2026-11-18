"use client";

import { ChevronDown, CloudOff, Radio, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BlogConfigStatus } from "../types";

const blogStatusControlContentPage = {
  menuItem: cn("cursor-pointer gap-3"),
  publishedBadge: cn("border-income/30 text-income bg-income/10"),
  publishedItem: cn("text-income focus:text-income focus:bg-income/5"),
  scheduledItem: cn("text-warning focus:text-warning focus:bg-oro/5"),
  archivedBadge: cn("border-destructive/30 text-destructive bg-destructive/10"),
  archivedItem: cn("text-destructive focus:text-destructive focus:bg-destructive/5"),
  caption: cn("text-xs font-mono uppercase tracking-wider text-muted-foreground"),
  dot: cn("ml-auto size-1.5 rounded-full bg-current shrink-0"),
};

// ─── Public contracts ────────────────────────────────────────────────────────

export interface BlogStatusControlProps {
  status: BlogConfigStatus;
  onStatusChange: (status: BlogConfigStatus) => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  live: {
    label: "En vivo",
    description: "El blog es visible al público",
    icon: Radio,
    pill: blogStatusControlContentPage.publishedBadge,
    item: blogStatusControlContentPage.publishedItem,
  },
  maintenance: {
    label: "En reforma",
    description: "Visible sólo para administradores",
    icon: Wrench,
    pill: "border-oro/30 text-warning bg-oro/10",
    item: blogStatusControlContentPage.scheduledItem,
  },
  offline: {
    label: "Fuera de servicio",
    description: "El blog está deshabilitado",
    icon: CloudOff,
    pill: blogStatusControlContentPage.archivedBadge,
    item: blogStatusControlContentPage.archivedItem,
  },
} as const satisfies Record<
  BlogConfigStatus,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    pill: string;
    item: string;
  }
>;

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as BlogConfigStatus[];

// ─── Component ────────────────────────────────────────────────────────────────

export function BlogStatusControl({ status, onStatusChange }: BlogStatusControlProps) {
  const current = STATUS_CONFIG[status];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="outline" size="sm" className={cn("gap-2 font-medium", current.pill)}>
          <Icon className="size-3.5" />
          <span>{current.label}</span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className={blogStatusControlContentPage.caption}>
          Estado del blog
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const ItemIcon = cfg.icon;
          const isActive = s === status;

          return (
            <DropdownMenuItem
              key={s}
              onClick={() => onStatusChange(s)}
              className={cn(
                blogStatusControlContentPage.menuItem,
                cfg.item,
                isActive && "font-semibold",
              )}
            >
              <ItemIcon className="size-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm leading-none">{cfg.label}</p>
                <p className="mt-0.5 text-xs opacity-70 font-normal">{cfg.description}</p>
              </div>
              {isActive && <span className={blogStatusControlContentPage.dot} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
