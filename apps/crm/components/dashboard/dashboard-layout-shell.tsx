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
    route: "sermons",
    internalRoute: churchToDashboardRouteMap.sermons,
    section: "Contenido",
    title: "Sermones",
    ctaLabel: "Nuevo sermón",
    ctaHref: getChurchRoutePath("sermons", "new"),
  },
  {
    route: "ministries",
    internalRoute: churchToDashboardRouteMap.ministries,
    section: "Contenido",
    title: "Ministerios",
    ctaLabel: "Nuevo ministerio",
    ctaHref: getChurchRoutePath("ministries"),
  },
  {
    route: "inventory",
    internalRoute: churchToDashboardRouteMap.inventory,
    section: "Gobierno",
    title: "Inventario",
    ctaLabel: "Nuevo ítem",
    ctaHref: getChurchRoutePath("inventory"),
  },
  {
    route: "assembly",
    internalRoute: churchToDashboardRouteMap.assembly,
    section: "Gobierno",
    title: "Asamblea",
    ctaLabel: "Publicar informe",
    ctaHref: getChurchRoutePath("assembly"),
  },
];

const dashboardLayoutShellDashboardPage = {
  sidebarProvider: cn("min-h-svh bg-[var(--background)] text-foreground"),
  sidebarInset: cn("min-w-0 overflow-hidden bg-[var(--background)]"),
  header: cn(
    "sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 md:px-7",
  ),
  sidebarTrigger: cn(
    "size-9 rounded-[10px] text-[var(--tinta-suave)] hover:bg-[var(--bruma)] md:hidden",
  ),
  label: cn(
    "truncate font-display text-lg font-medium leading-none tracking-normal text-foreground",
  ),
  block: cn(
    "hidden items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground xl:inline-flex",
  ),
  labelRounded: cn(
    "relative size-1.5 rounded-full bg-primary before:absolute before:inset-[-3px] before:rounded-full before:bg-primary/30 before:content-[''] before:animate-ping",
  ),
  blockFlex: cn(
    "hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bruma)] px-3 py-2 text-xs text-muted-foreground lg:flex",
  ),
  blockBorder: cn("rounded border border-[var(--input)] px-1.5 font-mono text-[10px]"),
  labelSize: cn("absolute right-2 top-2 size-1.5 rounded-full bg-primary"),
  blockBg: cn("mx-1 hidden h-7 w-px bg-[var(--border)] sm:block"),
  action: cn(
    "hidden rounded-full bg-foreground px-4 text-xs font-semibold tracking-[0.04em] text-background hover:bg-primary sm:inline-flex",
  ),
  actionFlex: cn(
    "ml-1 flex items-center gap-2 rounded-full bg-[var(--bruma)] p-1 pr-2 text-left transition hover:bg-[var(--background)] hover:shadow-[var(--sombra)]",
  ),
  labelFlex: cn(
    "flex size-8 items-center justify-center rounded-full bg-primary font-display text-sm font-medium text-white",
  ),
  labelText: cn("block text-sm font-semibold text-foreground"),
  label2: cn("block text-[11px] capitalize text-muted-foreground"),
  chevronDown: cn("hidden size-3 text-muted-foreground md:block"),
  block2: cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth"),
  block3: cn("mx-auto w-full max-w-[1480px] px-5 py-7 pb-20 md:px-8"),
};

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
        "relative size-9 rounded-[10px] text-[var(--tinta-suave)] hover:bg-[var(--bruma)] hover:text-foreground",
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
      className={dashboardLayoutShellDashboardPage.sidebarProvider}
      style={
        {
          "--sidebar-width": "16.5rem",
          "--sidebar-width-icon": "4.75rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className={dashboardLayoutShellDashboardPage.sidebarInset}>
        <header className={dashboardLayoutShellDashboardPage.header}>
          <SidebarTrigger className={dashboardLayoutShellDashboardPage.sidebarTrigger} />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-xs text-muted-foreground">{currentRoute.section}</span>
            <span className="text-[var(--input)]">/</span>
            <span className={dashboardLayoutShellDashboardPage.label}>{currentRoute.title}</span>
          </div>

          <div className={dashboardLayoutShellDashboardPage.block}>
            <span className={dashboardLayoutShellDashboardPage.labelRounded} />
            {churchConfig.name} activo
          </div>

          <div className={dashboardLayoutShellDashboardPage.blockFlex}>
            <Search className="size-3.5" />
            Buscar
            <kbd className={dashboardLayoutShellDashboardPage.blockBorder}>Ctrl K</kbd>
          </div>

          <div className="flex items-center gap-1.5">
            <HeaderIconButton aria-label="Notificaciones">
              <Bell className="size-4" />
              <span className={dashboardLayoutShellDashboardPage.labelSize} />
            </HeaderIconButton>
            <HeaderIconButton aria-label="Mensajes" className="hidden sm:inline-flex">
              <MessageSquare className="size-4" />
            </HeaderIconButton>
            <HeaderIconButton aria-label="Ayuda" className="hidden sm:inline-flex">
              <CircleHelp className="size-4" />
            </HeaderIconButton>

            <div className={dashboardLayoutShellDashboardPage.blockBg} />

            <Button asChild={true} className={dashboardLayoutShellDashboardPage.action}>
              <Link href={currentRoute.ctaHref}>
                <Plus className="size-3.5" />
                {currentRoute.ctaLabel}
              </Link>
            </Button>

            <button className={dashboardLayoutShellDashboardPage.actionFlex} type="button">
              <span className={dashboardLayoutShellDashboardPage.labelFlex}>{userInitials}</span>
              <span className="hidden leading-tight md:block">
                <span className={dashboardLayoutShellDashboardPage.labelText}>
                  {currentUser.name}
                </span>
                <span className={dashboardLayoutShellDashboardPage.label2}>{currentUser.role}</span>
              </span>
              <ChevronDown className={dashboardLayoutShellDashboardPage.chevronDown} />
            </button>
          </div>
        </header>

        <div className={dashboardLayoutShellDashboardPage.block2}>
          <div className={dashboardLayoutShellDashboardPage.block3}>{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
