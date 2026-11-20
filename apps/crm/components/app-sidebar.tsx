"use client";

import type { Permission } from "@ancla/contracts";
import {
  ArrowLeftRight,
  Boxes,
  ChevronRight,
  FileBarChart2,
  FileText,
  FolderKanban,
  Globe,
  HandCoins,
  HeartHandshake,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  Mic,
  MonitorPlay,
  Newspaper,
  PiggyBank,
  Receipt,
  Settings,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import { BrandMark } from "@/components/dashboard";
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
import { useAccess } from "@/lib/authz/AccessProvider";
import { type AccessSnapshot, canAny } from "@/lib/authz/can";
import { PEOPLE_ROUTE_PERMISSIONS, ROUTE_PERMISSIONS } from "@/lib/authz/routePermissions";
import { churchToDashboardRouteMap, getChurchRoutePath } from "@/lib/church";
import { moneyRequests } from "@/lib/data";
import { cn } from "@/lib/utils";
import { type SidebarUser, SidebarUserMenu } from "./sidebar-user-menu";

type NavigationIcon = React.ComponentType<{ className?: string }>;

/** Any one of these shows the item; an empty list shows it to every signed-in user. */
type Requires = readonly Permission[];

type NavigationLinkItem = {
  type: "link";
  title: string;
  url: string;
  icon: NavigationIcon;
  requires: Requires;
  badge?: number;
  /** Active only on its own page, not on the pages nested under it (e.g. /website/people). */
  exact?: boolean;
};

type NavigationGroupItem = {
  type: "group";
  id: string;
  defaultOpen?: boolean;
  title: string;
  icon: NavigationIcon;
  items: {
    title: string;
    url: string | null;
    icon: NavigationIcon;
    requires: Requires;
    soon?: boolean;
  }[];
};

type NavigationItem = NavigationLinkItem | NavigationGroupItem;

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

/**
 * The menu the person may see: items without permission disappear, and so do groups and sections
 * left empty. The server guards each route as well, so hiding is a convenience, not security.
 */
function filterNavigation(
  sections: NavigationSection[],
  access: AccessSnapshot,
): NavigationSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.flatMap((item): NavigationItem[] => {
        if (item.type === "link") return canAny(access, item.requires) ? [item] : [];
        const items = item.items.filter((subItem) => canAny(access, subItem.requires));
        return items.length > 0 ? [{ ...item, items }] : [];
      }),
    }))
    .filter((section) => section.items.length > 0);
}

const pendingRequestsCount = moneyRequests.filter((request) => request.status === "pending").length;

export const navigationSections: NavigationSection[] = [
  {
    label: "Tesorería",
    items: [
      {
        type: "link",
        title: "Resumen",
        url: getChurchRoutePath("resume"),
        icon: LayoutDashboard,
        requires: ROUTE_PERMISSIONS.resume,
      },
      {
        type: "link",
        title: "Movimientos",
        url: getChurchRoutePath("movements"),
        icon: ArrowLeftRight,
        requires: ROUTE_PERMISSIONS.movements,
      },
      {
        type: "link",
        title: "Solicitudes",
        url: getChurchRoutePath("requests"),
        icon: HandCoins,
        requires: ROUTE_PERMISSIONS.requests,
        badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      },
      {
        type: "link",
        title: "Boletas",
        url: getChurchRoutePath("receipts"),
        icon: Receipt,
        requires: ROUTE_PERMISSIONS.receipts,
      },
      {
        type: "link",
        title: "Comprobantes",
        url: getChurchRoutePath("vouchers"),
        icon: FileText,
        requires: ROUTE_PERMISSIONS.vouchers,
      },
      {
        type: "link",
        title: "Proyectos",
        url: getChurchRoutePath("projects"),
        icon: FolderKanban,
        requires: ROUTE_PERMISSIONS.projects,
      },
      {
        type: "link",
        title: "Presupuestos",
        url: getChurchRoutePath("budgets"),
        icon: PiggyBank,
        requires: ROUTE_PERMISSIONS.budgets,
      },
      {
        type: "link",
        title: "Inventario",
        url: getChurchRoutePath("inventory"),
        icon: Boxes,
        requires: ROUTE_PERMISSIONS.inventory,
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
        requires: ROUTE_PERMISSIONS.voting,
      },
      {
        type: "link",
        title: "Informes",
        url: getChurchRoutePath("reports"),
        icon: FileBarChart2,
        requires: ROUTE_PERMISSIONS.reports,
      },
    ],
  },
  {
    label: "Contenido",
    items: [
      {
        type: "link",
        title: "Sitio web",
        url: getChurchRoutePath("website"),
        icon: Globe,
        requires: ROUTE_PERMISSIONS.website,
        exact: true,
      },
      {
        type: "link",
        title: "Personas",
        url: getChurchRoutePath("website", "people"),
        icon: Users,
        requires: PEOPLE_ROUTE_PERMISSIONS,
      },
      {
        type: "link",
        title: "Blog",
        url: getChurchRoutePath("blog"),
        icon: Newspaper,
        requires: ROUTE_PERMISSIONS.blog,
      },
      {
        type: "group",
        id: "contents",
        defaultOpen: true,
        title: "Contenidos",
        icon: LayoutGrid,
        items: [
          {
            title: "Podcasts",
            url: getChurchRoutePath("podcasts"),
            icon: Mic,
            requires: ROUTE_PERMISSIONS.podcasts,
          },
          {
            title: "Sermones",
            url: getChurchRoutePath("sermons"),
            icon: MonitorPlay,
            requires: ROUTE_PERMISSIONS.sermons,
          },
          {
            title: "Ministerios",
            url: getChurchRoutePath("ministries"),
            icon: HeartHandshake,
            requires: ROUTE_PERMISSIONS.ministries,
          },
          {
            title: "Galería",
            url: null,
            icon: ImageIcon,
            requires: ROUTE_PERMISSIONS.blog,
            soon: true,
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
        requires: ROUTE_PERMISSIONS.settings,
      },
    ],
  },
];

const menuButtonShared = cn(
  "h-[42px] gap-3 rounded-[14px] px-3 text-sm font-medium text-white/70",
  "hover:bg-white/5 hover:text-white",
  "data-[active=true]:bg-white/[0.09] data-[active=true]:font-bold data-[active=true]:text-white",
  "data-[active=true]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]",
  "[&>svg]:size-[19px] data-[active=true]:[&>svg]:text-[var(--oro-100)]",
);

const appSidebarSharedPage = {
  sidebar: cn(
    "border-0 p-0 [&>[data-slot=sidebar-inner]]:bg-transparent",
    "[&>[data-slot=sidebar-inner]]:text-white",
  ),
  header: cn("px-3 pt-[18px] pb-3.5"),
  brandLink: cn("inline-flex items-center gap-2.5 px-2.5"),
  brandMark: cn("shadow-[0_8px_18px_-8px_rgba(194,58,78,0.9)]"),
  brandName: cn("font-display text-[21px] font-semibold tracking-tight text-white"),
  content: cn(
    "gap-0 px-3",
    // Thin translucent scrollbar that blends with the dark sidebar instead of the system one.
    "[scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.14)_transparent]",
    "hover:[scrollbar-color:rgb(255_255_255/0.3)_transparent]",
  ),
  group: cn("gap-0.5 p-0"),
  groupLabel: cn(
    "h-auto px-3 pt-4 pb-1.5 text-[11px] font-bold tracking-[0.14em] text-white/[0.42] uppercase",
  ),
  menu: cn("gap-0.5"),
  menuButton: cn(menuButtonShared),
  chevron: cn(
    "ml-auto size-4 transition-transform duration-200 ease-out motion-reduce:transition-none",
  ),
  subMenuContent: cn(
    "overflow-hidden",
    "data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
    "motion-reduce:animate-none",
  ),
  badge: cn(
    "ml-auto inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-(image:--grad-granada) px-[7px] text-[11px] font-extrabold text-white",
  ),
  subMenu: cn("mx-0 ml-[22px] gap-0 border-l-0 px-0 py-0.5"),
  subSoon: cn(
    "flex h-[38px] items-center gap-2.5 border-l border-white/[0.16] px-3 text-[13.5px] font-medium text-white/65",
  ),
  soonTag: cn(
    "ml-auto text-[9.5px] font-extrabold tracking-[0.08em] text-[var(--oro-100)] uppercase opacity-80",
  ),
  subButton: cn(
    "h-[38px] gap-2.5 rounded-xl rounded-l-none border-l border-white/[0.16] px-3 text-[13.5px] font-medium text-white/65",
    "hover:bg-white/5 hover:text-white",
    "data-[active=true]:bg-white/[0.09] data-[active=true]:text-white",
  ),
  footer: cn("px-3 pb-3"),
  closeCard: cn(
    "flex flex-col gap-3 rounded-[22px] bg-white/[0.07] p-4 text-white backdrop-blur-[10px]",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]",
  ),
  closeIcon: cn(
    "inline-flex size-[34px] items-center justify-center rounded-full bg-white/[0.12]",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]",
  ),
  closeText: cn("flex flex-col gap-0.5"),
  closeTitle: cn("text-[15px] font-bold"),
  closeSubtitle: cn("text-xs text-white/65"),
  segments: cn("flex gap-1"),
  segmentDone: cn("h-[22px] flex-1 rounded-full bg-(image:--grad-oro)"),
  segmentPending: cn("h-[22px] flex-1 rounded-full bg-white/[0.14]"),
  closeAction: cn(
    "inline-flex h-9 items-center self-start rounded-full bg-white/10 px-4 text-[13px] font-bold text-white",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] transition hover:-translate-y-px",
  ),
};

function getNavigationMatchUrls(url: string): string[] {
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

function isNavigationItemActive(pathname: string, url: string | null, exact = false): boolean {
  if (!url) {
    return false;
  }
  return getNavigationMatchUrls(url).some(
    (matchUrl) => pathname === matchUrl || (!exact && pathname.startsWith(`${matchUrl}/`)),
  );
}

function isNavigationGroupActive(pathname: string, item: NavigationGroupItem): boolean {
  return item.items.some((subItem) => isNavigationItemActive(pathname, subItem.url));
}

function NavigationLink({ item, pathname }: { item: NavigationLinkItem; pathname: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={true}
        className={appSidebarSharedPage.menuButton}
        isActive={isNavigationItemActive(pathname, item.url, item.exact)}
      >
        <Link href={item.url}>
          <item.icon />
          <span>{item.title}</span>
          {item.badge ? <span className={appSidebarSharedPage.badge}>{item.badge}</span> : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavigationGroup({ item, pathname }: { item: NavigationGroupItem; pathname: string }) {
  const isActive = isNavigationGroupActive(pathname, item);
  const [open, setOpen] = useState(item.defaultOpen ?? isActive);

  return (
    <Collapsible open={open || isActive} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild={true}>
          <SidebarMenuButton className={appSidebarSharedPage.menuButton} isActive={isActive}>
            <item.icon />
            <span>{item.title}</span>
            <ChevronRight
              className={cn(appSidebarSharedPage.chevron, (open || isActive) && "rotate-90")}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className={appSidebarSharedPage.subMenuContent}>
          <SidebarMenuSub className={appSidebarSharedPage.subMenu}>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                {subItem.url ? (
                  <SidebarMenuSubButton
                    asChild={true}
                    className={appSidebarSharedPage.subButton}
                    isActive={isNavigationItemActive(pathname, subItem.url)}
                  >
                    <Link href={subItem.url}>
                      <subItem.icon className="size-4" />
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                ) : (
                  <span className={appSidebarSharedPage.subSoon}>
                    <subItem.icon className="size-4" />
                    <span>{subItem.title}</span>
                    <span className={appSidebarSharedPage.soonTag}>Pronto</span>
                  </span>
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

interface AppSidebarProps {
  user: SidebarUser | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const access = useAccess();
  const visibleSections = filterNavigation(navigationSections, access);

  return (
    <Sidebar className={appSidebarSharedPage.sidebar} collapsible="offcanvas" variant="inset">
      <SidebarHeader className={appSidebarSharedPage.header}>
        <Link className={appSidebarSharedPage.brandLink} href={getChurchRoutePath("resume")}>
          <BrandMark className={appSidebarSharedPage.brandMark} />
          <b className={appSidebarSharedPage.brandName}>iEkklesia</b>
        </Link>
      </SidebarHeader>

      <SidebarContent className={appSidebarSharedPage.content}>
        {visibleSections.map((section) => (
          <SidebarGroup className={appSidebarSharedPage.group} key={section.label}>
            <SidebarGroupLabel className={appSidebarSharedPage.groupLabel}>
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className={appSidebarSharedPage.menu}>
                {section.items.map((item) =>
                  item.type === "group" ? (
                    <NavigationGroup item={item} key={item.id} pathname={pathname} />
                  ) : (
                    <NavigationLink item={item} key={item.title} pathname={pathname} />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className={appSidebarSharedPage.footer}>
        <SidebarUserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
