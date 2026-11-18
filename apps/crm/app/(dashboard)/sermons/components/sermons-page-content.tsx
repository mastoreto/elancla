"use client";

import { Eye, Library, Radio, Send } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ListPagination } from "@/components/list-pagination";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { DashboardMetricStrip, DashboardPageHeader } from "@/src/componentes/dashboard";
import { sermons } from "../data/sermons";
import type { SermonStatusFilter } from "../types";
import { countByStatus, filterSermons, getTotalPlays, SERMONS_PAGE_SIZE } from "../utils";
import { SermonsLiveBanner } from "./sermons-live-banner";
import { SermonsTable } from "./sermons-table";
import { SermonsToolbar } from "./sermons-toolbar";

const sermonsPageContentSermonsPage = {
  page: cn("space-y-6"),
  action: cn("rounded-full"),
};

export function SermonsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<SermonStatusFilter>("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => countByStatus(sermons), []);
  const filtered = useMemo(
    () => filterSermons(sermons, searchQuery, status),
    [searchQuery, status],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / SERMONS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * SERMONS_PAGE_SIZE,
    currentPage * SERMONS_PAGE_SIZE,
  );

  return (
    <div className={sermonsPageContentSermonsPage.page}>
      <DashboardPageHeader
        actions={
          <Button asChild={true} className={sermonsPageContentSermonsPage.action}>
            <Link href={getChurchRoutePath("sermons", "new")}>Nuevo sermón</Link>
          </Button>
        }
        description="Biblioteca de prédicas con video de YouTube, pasaje bíblico y serie."
        emphasis="de la iglesia"
        kicker="Contenido"
        title="Sermones"
      />

      <DashboardMetricStrip
        metrics={[
          {
            accent: true,
            label: "Sermones",
            value: String(counts.all),
            detail: "En la biblioteca",
            icon: Library,
          },
          {
            label: "Publicados",
            value: String(counts.published),
            detail: "Visibles en el sitio",
            icon: Send,
          },
          {
            label: "Reproducciones",
            value: new Intl.NumberFormat("es-UY").format(getTotalPlays(sermons)),
            detail: "Suma de los publicados",
            icon: Eye,
          },
          {
            label: "Próximo directo",
            value: "Dom 11:15",
            detail: "Detección automática de YouTube",
            icon: Radio,
          },
        ]}
      />

      <SermonsLiveBanner />

      <SermonsToolbar
        counts={counts}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        searchQuery={searchQuery}
        status={status}
      />

      <SermonsTable sermons={visible} />

      <ListPagination
        onPageChange={setPage}
        page={currentPage}
        pageSize={SERMONS_PAGE_SIZE}
        total={filtered.length}
      />
    </div>
  );
}
