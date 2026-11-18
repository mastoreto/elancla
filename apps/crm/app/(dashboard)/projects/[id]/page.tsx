/** biome-ignore-all lint/security/noSecrets: <explanation> */
/** biome-ignore-all lint/performance/useSolidForComponent: <explanation> */
"use client";

import {
  Archive,
  ArrowLeft,
  CheckCircle,
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Play,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getChurchRoutePath } from "@/lib/church";
import { currentUser, movements as initialMovements, projects } from "@/lib/data";
import type { Movement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProjectDocuments } from "../components/project-documents";
import { ProjectFormModal } from "../components/project-form-modal";
import { ProjectMovements } from "../components/project-movements";
import { ProjectStatusBadge } from "../components/project-status-badge";
import { ProjectSummary } from "../components/project-summary";
import { ProjectTimeline } from "../components/project-timeline";

const pageProjectsPage = {
  header: cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"),
};

type ProjectTabValue = "summary" | "movements" | "documents" | "history";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<ProjectTabValue>("summary");
  const [movements, setMovements] = useState<Movement[]>(initialMovements);

  if (!project) {
    notFound();
  }

  // Calculate project-specific stats
  const projectMovements = movements.filter((m) => m.project === project.name);
  const totalIncome = projectMovements
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + m.amount, 0);
  const totalExpenses = projectMovements
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + m.amount, 0);

  const canEdit =
    currentUser.role === "admin" ||
    currentUser.role === "treasurer" ||
    project.createdBy === currentUser.name;

  const statusActions = {
    planning: { label: "Iniciar Proyecto", icon: Play, nextStatus: "in_progress" },
    in_progress: { label: "Marcar Terminado", icon: CheckCircle, nextStatus: "finished" },
    finished: { label: "Cerrar Proyecto", icon: Archive, nextStatus: "closed" },
    closed: null,
  };

  const currentStatusAction = statusActions[project.status];
  const handleCreateMovement = (newMovement: Omit<Movement, "id">) => {
    setMovements((currentMovements) => [
      {
        ...newMovement,
        id: String(currentMovements.length + 1),
      },
      ...currentMovements,
    ]);
  };

  const projectTabs = [
    { value: "summary", label: "Resumen" },
    { value: "movements", label: `Movimientos (${projectMovements.length})` },
    { value: "documents", label: `Documentos (${project.documents.length})` },
    { value: "history", label: `Historial (${project.history.length})` },
  ] satisfies Array<{ value: ProjectTabValue; label: string }>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className={pageProjectsPage.header}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild={true}>
            <Link href={getChurchRoutePath("projects")}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground">Creado por {project.createdBy}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {currentStatusAction && (
              <Button variant="outline">
                <currentStatusAction.icon className="mr-2 size-4" />
                {currentStatusAction.label}
              </Button>
            )}
            <ProjectFormModal
              project={project}
              trigger={
                <Button variant="outline">
                  <Edit className="mr-2 size-4" />
                  Editar
                </Button>
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="size-4" />
                  Exportar Reporte
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="size-4" />
                  Duplicar Proyecto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 className="size-4" />
                  Eliminar Proyecto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ProjectTabValue)}
        className="w-full"
      >
        <TabsList className="w-full justify-start">
          {projectTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div>
          <TabsContent value="summary" className="m-0">
            <ProjectSummary
              project={project}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
            />
          </TabsContent>

          <TabsContent value="movements" className="m-0">
            <ProjectMovements
              projectName={project.name}
              movements={projectMovements}
              canEdit={canEdit}
              onCreateMovement={handleCreateMovement}
            />
          </TabsContent>

          <TabsContent value="documents" className="m-0">
            <ProjectDocuments documents={project.documents} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="history" className="m-0">
            <Card>
              <CardContent className="pt-6">
                <ProjectTimeline history={project.history} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
