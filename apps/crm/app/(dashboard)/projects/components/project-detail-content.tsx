"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { CreateMovementDialog } from "@/components/create-movement-dialog";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardTabs } from "@/components/dashboard/board/board-tabs";
import { getChurchRoutePath } from "@/lib/church";
import { currentUser, projects, movements as seedMovements } from "@/lib/data";
import type { Movement, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { extraProjectMovements } from "../data/extra-movements";
import { ProjectDetailHero } from "./project-detail-hero";
import { ProjectDetailStats } from "./project-detail-stats";
import { ProjectDocumentsCard } from "./project-documents-card";
import { ProjectHistoryCard } from "./project-history-card";
import { ProjectMovementsCard } from "./project-movements-card";

type ProjectTab = "summary" | "movements" | "documents" | "history";

const RECENT_EXPENSES = 4;

const projectDetailContentProjectsPage = {
  page: cn("flex flex-col gap-5"),
  breadcrumb: cn("flex items-center gap-2 text-sm"),
  crumbLink: cn("font-medium text-[var(--tinta-apagada)] hover:text-foreground"),
  crumbIcon: cn("size-4 text-[var(--tinta-apagada)]"),
  crumbCurrent: cn("font-bold"),
  split: cn("grid items-start gap-[18px] xl:grid-cols-[1.5fr_1fr]"),
  aside: cn("flex flex-col gap-[18px]"),
  addIcon: cn("size-4"),
};

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const project = projects.find((item) => item.id === projectId);
  const [activeTab, setActiveTab] = useState<ProjectTab>("summary");
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [movements, setMovements] = useState<Movement[]>([
    ...seedMovements,
    ...extraProjectMovements,
  ]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const today = useMemo(() => new Date(), []);

  if (!project) {
    notFound();
  }

  const projectMovements = movements
    .filter((movement) => movement.project === project.name)
    .sort((a, b) => b.date.localeCompare(a.date));
  const recentExpenses = projectMovements
    .filter((movement) => movement.type === "expense")
    .slice(0, RECENT_EXPENSES);
  const canEdit =
    currentUser.role === "admin" ||
    currentUser.role === "treasurer" ||
    project.createdBy === currentUser.name;

  const createMovement = (movement: Omit<Movement, "id">) => {
    setMovements((current) => [{ ...movement, id: `new-${current.length + 1}` }, ...current]);
  };

  const addMovementButton = canEdit ? (
    <BoardButton onClick={() => setIsCreateOpen(true)} size="sm" variant="soft">
      <Plus aria-hidden="true" className={projectDetailContentProjectsPage.addIcon} />
      Añadir movimiento
    </BoardButton>
  ) : null;

  return (
    <div className={projectDetailContentProjectsPage.page}>
      <nav aria-label="Ruta" className={projectDetailContentProjectsPage.breadcrumb}>
        <Link
          className={projectDetailContentProjectsPage.crumbLink}
          href={getChurchRoutePath("projects")}
        >
          Proyectos
        </Link>
        <ChevronRight aria-hidden="true" className={projectDetailContentProjectsPage.crumbIcon} />
        <span className={projectDetailContentProjectsPage.crumbCurrent}>{project.name}</span>
      </nav>

      <ProjectDetailHero
        canEdit={canEdit}
        onStatusChange={setStatus}
        project={project}
        status={status ?? project.status}
      />
      <ProjectDetailStats movements={projectMovements} project={project} today={today} />

      <BoardTabs
        items={[
          { value: "summary", label: "Resumen" },
          { value: "movements", label: "Movimientos", count: projectMovements.length },
          { value: "documents", label: "Documentos", count: project.documents.length },
          { value: "history", label: "Historial" },
        ]}
        label="Secciones del proyecto"
        onValueChange={setActiveTab}
        value={activeTab}
      />

      {activeTab === "summary" ? (
        <div className={projectDetailContentProjectsPage.split}>
          <ProjectMovementsCard
            movements={recentExpenses}
            subtitle={`Últimos ${recentExpenses.length} egresos`}
            title="Movimientos del proyecto"
          />
          <div className={projectDetailContentProjectsPage.aside}>
            <ProjectDocumentsCard canEdit={canEdit} documents={project.documents} />
            <ProjectHistoryCard history={project.history} />
          </div>
        </div>
      ) : null}

      {activeTab === "movements" ? (
        <ProjectMovementsCard
          action={addMovementButton}
          movements={projectMovements}
          subtitle={`${projectMovements.length} movimientos registrados`}
          title="Movimientos del proyecto"
        />
      ) : null}

      {activeTab === "documents" ? (
        <ProjectDocumentsCard canEdit={canEdit} documents={project.documents} />
      ) : null}

      {activeTab === "history" ? <ProjectHistoryCard history={project.history} /> : null}

      <CreateMovementDialog
        fixedProject={project.name}
        onOpenChange={setIsCreateOpen}
        onSubmit={createMovement}
        open={isCreateOpen}
      />
    </div>
  );
}
