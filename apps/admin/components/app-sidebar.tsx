"use client";

import {
  ArrowLeftRight,
  ChevronRight,
  FileBarChart2,
  FileText,
  FileWarning,
  FolderKanban,
  Globe,
  HandCoins,
  LayoutDashboard,
  Mic,
  Newspaper,
  PiggyBank,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { churchConfig, churchToDashboardRouteMap, getChurchRoutePath } from "@/lib/church";
import { moneyRequests } from "@/lib/data";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/src/componentes/dashboard";

const pendingRequestsCount = moneyRequests.filter((request) => request.status === "pending").length;

type NavigationLinkItem = {
  type: "link";
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type NavigationGroupItem = {
  type: "group";
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Omit<NavigationLinkItem, "type">[];
};

type NavigationItem = NavigationLinkItem | NavigationGroupItem;

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

const navigationSections: NavigationSection[] = [
  {
    label: "Contenido",
    items: [
      {
        type: "link",
        title: "Sitio Web",
        url: getChurchRoutePath("website"),
        icon: Globe,
      },
      {
        type: "link",
        title: "Blog",
        url: getChurchRoutePath("blog"),
        icon: Newspaper,
      },
      {
        type: "link",
        title: "Podcasts",
        url: getChurchRoutePath("podcasts"),
        icon: Mic,
      },
      {
        type: "link",
        title: "General",
        url: getChurchRoutePath("general"),
        icon: Tags,
      },
    ],
  },
  {
    label: "Gobierno",
    items: [
      {
        type: "link",
        title: "Votaciones",
        url: getChurchRoutePath("voting"),
        icon: Vote,
      },
      {
        type: "link",
        title: "Informes",
        url: getChurchRoutePath("reports"),
        icon: FileBarChart2,
      },
    ],
  },
  {
    label: "Tesorería",
    items: [
      {
        type: "link",
        title: "Resumen",
        url: getChurchRoutePath("resume"),
        icon: LayoutDashboard,
      },
      {
        type: "link",
        title: "Movimientos",
        url: getChurchRoutePath("movements"),
        icon: ArrowLeftRight,
      },
      {
        type: "link",
        title: "Solicitudes",
        url: getChurchRoutePath("requests"),
        icon: HandCoins,
        badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      },
      {
        type: "group",
        id: "documents",
        title: "Documentos",
        icon: FileText,
        items: [
          {
            title: "Boletas",
            url: getChurchRoutePath("receipts"),
            icon: FileText,
          },
          {
            title: "Comprobantes",
            url: getChurchRoutePath("vouchers"),
            icon: FileWarning,
          },
        ],
      },
      {
        type: "group",
        id: "planning",
        title: "Planificación",
        icon: FolderKanban,
        items: [
          {
            title: "Proyectos",
            url: getChurchRoutePath("projects"),
            icon: FolderKanban,
          },
          {
            title: "Presupuestos",
            url: getChurchRoutePath("budgets"),
            icon: PiggyBank,
          },
        ],
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        type: "link",
        title: "Configuración",
        url: getChurchRoutePath("settings"),
        icon: Settings,
      },
    ],
  },
];

const menuButtonClassName =
  "relative h-10 rounded-[10px] px-3 text-[rgba(250,248,245,0.74)] hover:bg-white/5 hover:text-white data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-white before:absolute before:-left-3 before:top-1/2 before:hidden before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary data-[active=true]:before:block group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0";

const subButtonClassName =
  "h-8 rounded-[9px] text-[rgba(250,248,245,0.62)] hover:bg-white/5 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white";

function getNavigationMatchUrls(url: string) {
  const matchingRoute = Object.entries(churchToDashboardRouteMap).find(([route]) => {
    const publicUrl = getChurchRoutePath(route as keyof typeof churchToDashboardRouteMap);
    return url === publicUrl || url.startsWith(`${publicUrl}/`);
  });

  if (!matchingRoute) {
    return [url];
  }

  const [route, internalRoute] = matchingRoute;
  const publicUrl = getChurchRoutePath(route as keyof typeof churchToDashboardRouteMap);
  const suffix = url.replace(publicUrl, "");

  return [url, `/${internalRoute}${suffix}`];
}

function isNavigationItemActive(pathname: string, url: string) {
  return getNavigationMatchUrls(url).some(
    (matchUrl) => pathname === matchUrl || pathname.startsWith(`${matchUrl}/`),
  );
}

function isNavigationGroupActive(pathname: string, item: NavigationGroupItem) {
  return item.items.some((subItem) => isNavigationItemActive(pathname, subItem.url));
}

function createInitialGroupState(pathname: string) {
  return navigationSections.reduce<Record<string, boolean>>((state, section) => {
    for (const item of section.items) {
      if (item.type === "group") {
        state[item.id] = isNavigationGroupActive(pathname, item);
      }
    }

    return state;
  }, {});
}

function NavigationBadge({ value }: { value: number }) {
  return (
    <Badge className="ml-auto rounded-full border-0 bg-white/10 px-2 py-0 font-mono text-[10px] font-medium text-white/85 group-data-[collapsible=icon]:hidden">
      {value}
    </Badge>
  );
}

function NavigationLink({ item, pathname }: { item: NavigationLinkItem; pathname: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={true}
        className={menuButtonClassName}
        isActive={isNavigationItemActive(pathname, item.url)}
        tooltip={item.title}
      >
        <Link href={item.url}>
          <item.icon className="size-[18px]" />
          <span>{item.title}</span>
          {item.badge ? <NavigationBadge value={item.badge} /> : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavigationGroup({
  item,
  pathname,
  open,
  onOpenChange,
}: {
  item: NavigationGroupItem;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isActive = isNavigationGroupActive(pathname, item);

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild={true}>
          <SidebarMenuButton
            className={menuButtonClassName}
            isActive={isActive}
            tooltip={item.title}
          >
            <item.icon className="size-[18px]" />
            <span>{item.title}</span>
            <ChevronRight
              className={cn("ml-auto size-4 transition-transform", open && "rotate-90")}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub className="ml-6 border-white/10 py-1">
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild={true}
                  className={subButtonClassName}
                  isActive={isNavigationItemActive(pathname, subItem.url)}
                >
                  <Link href={subItem.url}>
                    <subItem.icon className="size-4" />
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState(() => createInitialGroupState(pathname));

  useEffect(() => {
    setOpenGroups((currentState) => {
      const nextState = { ...currentState };

      for (const section of navigationSections) {
        for (const item of section.items) {
          if (item.type === "group" && isNavigationGroupActive(pathname, item)) {
            nextState[item.id] = true;
          }
        }
      }

      return nextState;
    });
  }, [pathname]);

  return (
    <Sidebar
      className="border-r border-white/10 bg-[var(--dashboard-surface-strong)] text-[var(--dashboard-ink-inverse)]"
      collapsible="icon"
    >
      <SidebarHeader className="h-[72px] justify-center border-b border-white/10 px-[22px] py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild={true}
              className="h-12 rounded-[12px] px-0 text-white hover:bg-transparent hover:text-white group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0"
              size="lg"
            >
              <Link href={getChurchRoutePath("resume")}>
                <BrandMark />
                <span className="min-w-0 overflow-hidden leading-none group-data-[collapsible=icon]:hidden">
                  <span className="mb-1 block font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white/55">
                    Iglesia Bautista
                  </span>
                  <span className="block truncate font-display text-[19px] font-semibold tracking-normal text-white">
                    {churchConfig.name} · CMS
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="shrink-0 px-[18px] py-4 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <label className="flex h-10 items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.05] px-3 text-white/55 transition focus-within:border-primary focus-within:bg-white/[0.08] group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Search className="size-3.5 shrink-0" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/40 group-data-[collapsible=icon]:hidden"
            placeholder="Buscar..."
            type="text"
          />
          <span className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/50 group-data-[collapsible=icon]:hidden">
            Ctrl K
          </span>
        </label>
      </div>

      <SidebarContent className="gap-0 px-3 pb-6 group-data-[collapsible=icon]:px-2">
        {navigationSections.map((section) => (
          <SidebarGroup className="p-0" key={section.label}>
            <SidebarGroupLabel className="h-auto px-2 pb-2 pt-4 font-mono text-[9.5px] font-medium uppercase tracking-[0.22em] text-white/40 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-0">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item) =>
                  item.type === "group" ? (
                    <NavigationGroup
                      item={item}
                      key={item.id}
                      onOpenChange={(open) =>
                        setOpenGroups((currentState) => ({
                          ...currentState,
                          [item.id]: open,
                        }))
                      }
                      open={openGroups[item.id] ?? false}
                      pathname={pathname}
                    />
                  ) : (
                    <NavigationLink item={item} key={item.title} pathname={pathname} />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 px-[18px] py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 text-[11px] text-white/55">
          <span className="relative size-2 shrink-0 rounded-full bg-emerald-400 before:absolute before:inset-[-3px] before:rounded-full before:bg-emerald-400/40 before:content-[''] before:animate-ping" />
          <div className="min-w-0 leading-snug group-data-[collapsible=icon]:hidden">
            <strong className="font-semibold text-white">Sistema activo</strong>
            <br />
            <span>Interfaz local · sin BD</span>
          </div>
          <ShieldCheck className="ml-auto hidden size-4 text-white/35 group-data-[collapsible=icon]:block" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
