import { PERMISSIONS } from "@ancla/contracts";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { can } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { AuditFiltersForm } from "./components/audit-filters-form";
import { AuditTable } from "./components/audit-table";
import {
  auditHref,
  type RawSearchParams,
  readAuditFilters,
  toApiQuery,
} from "./utils/audit-filters";

const PAGE_SIZE = 25;

const auditPage = {
  breadcrumb: cn("mb-4 flex items-center gap-1.5 text-[13.5px] text-[var(--tinta-suave)]"),
  crumb: cn("hover:text-foreground"),
  crumbIcon: cn("size-3.5"),
  crumbCurrent: cn("font-bold text-foreground"),
  card: cn("flex flex-col gap-5 p-5"),
  empty: cn("py-8 text-center text-sm text-[var(--tinta-suave)]"),
  footer: cn("flex justify-between text-sm font-bold"),
  link: cn("text-primary hover:underline"),
};

interface AuditPageProps {
  searchParams: Promise<RawSearchParams>;
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function AuditPage({ searchParams }: AuditPageProps) {
  const access = await getAccess();
  // The proxy already gates this route; the page asks again because it is the one that reads.
  if (!(access && can(access, PERMISSIONS.audit.view))) notFound();

  const settingsPath = getChurchRoutePath("settings");
  const basePath = getChurchRoutePath("settings", "audit");
  const filters = readAuditFilters(await searchParams);
  const api = await createServerApiClient();
  const response = await api.audit.$get({ query: toApiQuery(filters, PAGE_SIZE) });
  const page = response.ok ? await response.json() : null;

  return (
    <>
      <nav aria-label="Ruta" className={auditPage.breadcrumb}>
        <Link className={auditPage.crumb} href={settingsPath}>
          Configuración
        </Link>
        <ChevronRight aria-hidden="true" className={auditPage.crumbIcon} />
        <span className={auditPage.crumbCurrent}>Auditoría</span>
      </nav>
      <BoardCard className={auditPage.card}>
        <BoardCardHeader
          subtitle="Registro inalterable de lo que ocurre en el sistema, del más reciente al más antiguo."
          title="Auditoría"
        />
        <AuditFiltersForm action={basePath} filters={{ ...filters, cursor: undefined }} />
        {page && page.items.length > 0 ? (
          <AuditTable items={page.items} />
        ) : (
          <p className={auditPage.empty}>
            {page ? "No hay eventos con estos filtros." : "No se pudo cargar la auditoría."}
          </p>
        )}
        <div className={auditPage.footer}>
          {filters.cursor ? (
            <Link
              className={auditPage.link}
              href={auditHref(basePath, { ...filters, cursor: undefined })}
            >
              ← Volver al inicio
            </Link>
          ) : (
            <span />
          )}
          {page?.nextCursor ? (
            <Link
              className={auditPage.link}
              href={auditHref(basePath, { ...filters, cursor: undefined }, page.nextCursor)}
            >
              Más antiguos →
            </Link>
          ) : null}
        </div>
      </BoardCard>
    </>
  );
}
