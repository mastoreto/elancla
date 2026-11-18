export interface ChurchConfig {
  name: string;
  slug: string;
  subtitle: string;
  profileImageUrl: string;
}

export const churchToDashboardRouteMap = {
  resume: "dashboard",
  receipts: "receipts",
  vouchers: "vouchers",
  projects: "projects",
  budgets: "budgets",
  requests: "requests",
  voting: "voting",
  movements: "movements",
  reports: "reports",
  settings: "settings",
  website: "website",
  blog: "blog",
  podcasts: "podcasts",
  ministries: "ministries",
  inventory: "inventory",
  assembly: "assembly",
} as const;

export const dashboardToChurchRouteMap = {
  dashboard: "resume",
  receipts: "receipts",
  vouchers: "vouchers",
  projects: "projects",
  budgets: "budgets",
  requests: "requests",
  voting: "voting",
  movements: "movements",
  reports: "reports",
  settings: "settings",
  website: "website",
  blog: "blog",
  podcasts: "podcasts",
  ministries: "ministries",
  inventory: "inventory",
  assembly: "assembly",
} as const;

export type ChurchRouteSegment = keyof typeof churchToDashboardRouteMap;
export type DashboardRouteSegment = keyof typeof dashboardToChurchRouteMap;

export const defaultChurchRouteSegment = "resume" as const;

const churchName = "El Ancla";

function normalizePathSegment(segment: string) {
  return segment.replace(/^\/+|\/+$/g, "");
}

export function createChurchSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getChurchInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("");
}

export const churchConfig = {
  name: churchName,
  slug: createChurchSlug(churchName),
  subtitle: "Administración Financiera",
  profileImageUrl: "/placeholder-logo.svg",
} satisfies ChurchConfig;

export function buildChurchRoutePath(
  churchSlug: string,
  route: ChurchRouteSegment,
  ...segments: string[]
) {
  const pathnameSegments = [churchSlug, route, ...segments]
    .map(normalizePathSegment)
    .filter(Boolean);

  return `/${pathnameSegments.join("/")}`;
}

export function getChurchRoutePath(route: ChurchRouteSegment, ...segments: string[]) {
  return buildChurchRoutePath(churchConfig.slug, route, ...segments);
}
