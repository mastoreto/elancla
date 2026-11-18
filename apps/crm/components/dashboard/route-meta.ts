import {
  type ChurchRouteSegment,
  churchToDashboardRouteMap,
  getChurchRoutePath,
} from "@/lib/church";

export type RouteMeta = {
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
    title: "Informes",
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
    title: "Sitio web",
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

export function getCurrentRouteMeta(pathname: string): RouteMeta {
  return routeMeta.find((meta) => isRouteMatch(pathname, meta)) ?? routeMeta[0];
}
