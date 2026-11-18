import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

interface ProjectsGridProps {
  projects: Project[];
}

const projectsGridProjectsPage = {
  grid: cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"),
  empty: cn(
    "col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card p-12 text-center",
  ),
  emptyTitle: cn("mb-1 font-semibold text-foreground"),
  emptyText: cn("text-sm text-muted-foreground"),
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <div className={projectsGridProjectsPage.grid}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
      {projects.length === 0 ? (
        <div className={projectsGridProjectsPage.empty}>
          <h3 className={projectsGridProjectsPage.emptyTitle}>No hay proyectos encontrados</h3>
          <p className={projectsGridProjectsPage.emptyText}>
            Intenta ajustando tus filtros o crea un nuevo proyecto
          </p>
        </div>
      ) : null}
    </div>
  );
}
