"use client";

import { Bell, ChevronDown, CircleHelp, MessageSquare, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  type ChurchRouteSegment,
  churchConfig,
  churchToDashboardRouteMap,
  getChurchInitials,
  getChurchRoutePath,
} from "@/lib/church";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

type DashboardLayoutShellProps = {
  children: React.ReactNode;
};

type RouteMeta = {
  route: ChurchRouteSegment;
  internalRoute: string;
  section: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
};

const routeMeta: RouteMeta[] = [
  {
    route: "resume",
    internalRoute: churchToDashboardRouteMap.resume,
    section: "Panel",
    title: "Resumen",
    ctaLabel: "Nuevo movimiento",
    ctaHref: getChurchRoutePath("movements"),
  },
  {
    route: "movements",
    internalRoute: churchToDashboardRouteMap.movements,
    section: "Tesorería",
    title: "Movimientos",
    ctaLabel: "Nuevo movimiento",
    ctaHref: getChurchRoutePath("movements"),
  },
  {
    route: "requests",
    internalRoute: churchToDashboardRouteMap.requests,
    section: "Tesorería",
    title: "Solicitudes",
    ctaLabel: "Nueva solicitud",
    ctaHref: getChurchRoutePath("requests"),
  },
  {
    route: "receipts",
    internalRoute: churchToDashboardRouteMap.receipts,
    section: "Documentos",
    title: "Boletas",
    ctaLabel: "Nueva boleta",
    ctaHref: getChurchRoutePath("receipts"),
  },
  {
    route: "vouchers",
    internalRoute: churchToDashboardRouteMap.vouchers,
    section: "Documentos",
    title: "Comprobantes",
    ctaLabel: "Nuevo comprobante",
    ctaHref: getChurchRoutePath("vouchers"),
  },
  {
    route: "projects",
    internalRoute: churchToDashboardRouteMap.projects,
    section: "Planificación",
    title: "Proyectos",
    ctaLabel: "Nuevo proyecto",
    ctaHref: getChurchRoutePath("projects"),
  },
  {
    route: "budgets",
    internalRoute: churchToDashboardRouteMap.budgets,
    section: "Planificación",
    title: "Presupuestos",
    ctaLabel: "Nuevo presupuesto",
    ctaHref: getChurchRoutePath("budgets"),
  },
  {
    route: "voting",
    internalRoute: churchToDashboardRouteMap.voting,
    section: "Gobierno",
    title: "Votaciones",
    ctaLabel: "Nueva votación",
    ctaHref: getChurchRoutePath("voting", "create"),
  },
  {
    route: "reports",
    internalRoute: churchToDashboardRouteMap.reports,
    section: "Informes",
    title: "Reportes",
    ctaLabel: "Nuevo reporte",
    ctaHref: getChurchRoutePath("reports", "new"),
  },
  {
    route: "settings",
    internalRoute: churchToDashboardRouteMap.settings,
    section: "Sistema",
    title: "Configuración",
    ctaLabel: "Invitar usuario",
    ctaHref: getChurchRoutePath("settings"),
  },
  {
    route: "website",
    internalRoute: churchToDashboardRouteMap.website,
    section: "Contenido",
    title: "Sitio Web",
    ctaLabel: "Editar sitio",
    ctaHref: getChurchRoutePath("website"),
  },
  {
    route: "blog",
    internalRoute: churchToDashboardRouteMap.blog,
    section: "Contenido",
    title: "Blog",
    ctaLabel: "Nuevo post",
    ctaHref: getChurchRoutePath("blog", "new"),
  },
  {
    route: "podcasts",
    internalRoute: churchToDashboardRouteMap.podcasts,
    section: "Contenido",
    title: "Podcasts",
    ctaLabel: "Nuevo podcast",
    ctaHref: getChurchRoutePath("podcasts", "new"),
  },
  {
    route: "general",
    internalRoute: churchToDashboardRouteMap.general,
    section: "Contenido",
    title: "General",
    ctaLabel: "Nueva categoría",
    ctaHref: getChurchRoutePath("general"),
  },
];

function isRouteMatch(pathname: string, meta: RouteMeta) {
  const publicPath = getChurchRoutePath(meta.route);
  const internalPath = `/${meta.internalRoute}`;

  return (
    pathname === publicPath ||
    pathname.startsWith(`${publicPath}/`) ||
    pathname === internalPath ||
    pathname.startsWith(`${internalPath}/`)
  );
}

function getCurrentRouteMeta(pathname: string) {
  return routeMeta.find((meta) => isRouteMatch(pathname, meta)) ?? routeMeta[0];
}

function HeaderIconButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "relative size-9 rounded-[10px] text-[var(--dashboard-ink-soft)] hover:bg-[var(--dashboard-canvas-muted)] hover:text-foreground",
        className,
      )}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    />
  );
}

export function DashboardLayoutShell({ children }: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const currentRoute = getCurrentRouteMeta(pathname);
  const userInitials = getChurchInitials(currentUser.name);

  return (
    <SidebarProvider
      className="min-h-svh bg-[var(--dashboard-canvas)] text-foreground"
      style={
        {
          "--sidebar-width": "16.5rem",
          "--sidebar-width-icon": "4.75rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden bg-[var(--dashboard-canvas)]">
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] px-4 md:px-7">
          <SidebarTrigger className="size-9 rounded-[10px] text-[var(--dashboard-ink-soft)] hover:bg-[var(--dashboard-canvas-muted)] md:hidden" />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-xs text-muted-foreground">{currentRoute.section}</span>
            <span className="text-[var(--dashboard-border-strong)]">/</span>
            <span className="truncate font-display text-lg font-medium leading-none tracking-normal text-foreground">
              {currentRoute.title}
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--dashboard-border)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground xl:inline-flex">
            <span className="relative size-1.5 rounded-full bg-primary before:absolute before:inset-[-3px] before:rounded-full before:bg-primary/30 before:content-[''] before:animate-ping" />
            {churchConfig.name} activo
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-canvas-muted)] px-3 py-2 text-xs text-muted-foreground lg:flex">
            <Search className="size-3.5" />
            Buscar
            <kbd className="rounded border border-[var(--dashboard-border-strong)] px-1.5 font-mono text-[10px]">
              Ctrl K
            </kbd>
          </div>

          <div className="flex items-center gap-1.5">
            <HeaderIconButton aria-label="Notificaciones">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
            </HeaderIconButton>
            <HeaderIconButton aria-label="Mensajes" className="hidden sm:inline-flex">
              <MessageSquare className="size-4" />
            </HeaderIconButton>
            <HeaderIconButton aria-label="Ayuda" className="hidden sm:inline-flex">
              <CircleHelp className="size-4" />
            </HeaderIconButton>

            <div className="mx-1 hidden h-7 w-px bg-[var(--dashboard-border)] sm:block" />

            <Button
              asChild={true}
              className="hidden rounded-full bg-foreground px-4 text-xs font-semibold tracking-[0.04em] text-background hover:bg-primary sm:inline-flex"
            >
              <Link href={currentRoute.ctaHref}>
                <Plus className="size-3.5" />
                {currentRoute.ctaLabel}
              </Link>
            </Button>

            <button
              className="ml-1 flex items-center gap-2 rounded-full bg-[var(--dashboard-canvas-muted)] p-1 pr-2 text-left transition hover:bg-[var(--dashboard-canvas)] hover:shadow-[var(--dashboard-shadow-soft)]"
              type="button"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary font-display text-sm font-medium text-white">
                {userInitials}
              </span>
              <span className="hidden leading-tight md:block">
                <span className="block text-sm font-semibold text-foreground">
                  {currentUser.name}
                </span>
                <span className="block text-[11px] capitalize text-muted-foreground">
                  {currentUser.role}
                </span>
              </span>
              <ChevronDown className="hidden size-3 text-muted-foreground md:block" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
          <div className="mx-auto w-full max-w-[1480px] px-5 py-7 pb-20 md:px-8">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
