"use client";

import type { EditorialInboxDto } from "@ancla/contracts";
import { MessageSquare, MoreHorizontal, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { EditorialInboxBell } from "@/components/editorial/editorial-inbox-bell";
import type { SidebarUser } from "@/components/sidebar-user-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getCurrentRouteMeta } from "./route-meta";

type DashboardLayoutShellProps = {
  children: React.ReactNode;
  user: SidebarUser | null;
  /** Pending editorial work for the header bell; `null` when it could not be loaded. */
  editorialInbox: EditorialInboxDto | null;
};

const iconButtonShared = cn(
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-foreground",
  "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition hover:-translate-y-px md:size-[42px]",
);

const dashboardLayoutShellDashboardPage = {
  sidebarProvider: cn("min-h-svh bg-(image:--grad-marco) p-0 text-foreground md:p-2.5"),
  sidebarInset: cn(
    "min-w-0 overflow-hidden bg-background md:h-[calc(100svh-1.25rem)]",
    "md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-[22px] md:peer-data-[variant=inset]:shadow-none",
  ),
  header: cn("flex flex-wrap items-center gap-3 px-4 pt-5 md:gap-4 md:px-7 md:pt-6"),
  sidebarTrigger: cn("size-10 rounded-full text-foreground md:hidden"),
  title: cn(
    "min-w-0 flex-1 truncate font-display text-2xl font-semibold tracking-tight md:text-[28px]",
  ),
  search: cn(
    "hidden h-[42px] w-80 items-center gap-2.5 rounded-full bg-card pr-2 pl-3.5 text-sm text-muted-foreground",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)] lg:flex",
  ),
  searchLabel: cn("flex-1 truncate"),
  key: cn(
    "inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-[7px] bg-secondary px-1.5 text-[11px] font-bold text-[var(--tinta-suave)]",
  ),
  actions: cn("flex flex-1 items-center justify-end gap-2"),
  iconButtonHiddenOnMobile: cn(iconButtonShared, "hidden sm:inline-flex"),
  body: cn("min-h-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth"),
  content: cn("mx-auto w-full max-w-[1480px] px-4 py-5 pb-20 md:px-7 md:py-6"),
};

export function DashboardLayoutShell({
  children,
  user,
  editorialInbox,
}: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const currentRoute = getCurrentRouteMeta(pathname);

  return (
    <SidebarProvider
      className={dashboardLayoutShellDashboardPage.sidebarProvider}
      style={{ "--sidebar-width": "15rem" } as React.CSSProperties}
    >
      <AppSidebar user={user} />
      <SidebarInset className={dashboardLayoutShellDashboardPage.sidebarInset}>
        <header className={dashboardLayoutShellDashboardPage.header}>
          <SidebarTrigger className={dashboardLayoutShellDashboardPage.sidebarTrigger} />
          <p className={dashboardLayoutShellDashboardPage.title}>{currentRoute.title}</p>

          <div className={dashboardLayoutShellDashboardPage.search}>
            <Search aria-hidden="true" className="size-[17px] shrink-0" />
            <span className={dashboardLayoutShellDashboardPage.searchLabel}>
              Buscar en iEkklesia…
            </span>
            <kbd className={dashboardLayoutShellDashboardPage.key}>⌘</kbd>
            <kbd className={dashboardLayoutShellDashboardPage.key}>K</kbd>
          </div>

          <div className={dashboardLayoutShellDashboardPage.actions}>
            <button
              aria-label="Mensajes"
              className={dashboardLayoutShellDashboardPage.iconButtonHiddenOnMobile}
              type="button"
            >
              <MessageSquare aria-hidden="true" className="size-[17px]" />
            </button>
            <EditorialInboxBell inbox={editorialInbox} />
            <button
              aria-label="Más opciones"
              className={dashboardLayoutShellDashboardPage.iconButtonHiddenOnMobile}
              type="button"
            >
              <MoreHorizontal aria-hidden="true" className="size-[17px]" />
            </button>
          </div>
        </header>

        <div className={dashboardLayoutShellDashboardPage.body}>
          <div className={dashboardLayoutShellDashboardPage.content}>{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
