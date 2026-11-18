"use client";

import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getChurchRoutePath } from "@/lib/church";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BudgetProgressBar } from "./budget-progress-bar";
import { ProjectStatusBadge } from "./project-status-badge";

const projectCardProjectsPage = {
  card: cn(
    "group hover:shadow-md transition-all duration-200 hover:border-accent/50 cursor-pointer h-full",
  ),
  name: cn("font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1"),
  description: cn("text-sm text-muted-foreground mt-1 line-clamp-2"),
  ministries: cn("flex items-center gap-1.5 text-muted-foreground"),
  dates: cn("flex items-center gap-1.5 text-xs text-muted-foreground"),
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={getChurchRoutePath("projects", project.id)}>
      <Card className={projectCardProjectsPage.card}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className={projectCardProjectsPage.name}>{project.name}</h3>
              {project.description && (
                <p className={projectCardProjectsPage.description}>{project.description}</p>
              )}
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <BudgetProgressBar
            budget={project.budget}
            spent={project.spent}
            currency={project.currency}
            size="sm"
          />

          <div className="flex items-center gap-4 text-sm">
            <div className={projectCardProjectsPage.ministries}>
              <Users className="size-3.5" />
              <span className="line-clamp-1">{project.ministries.join(", ")}</span>
            </div>
          </div>

          <div className={projectCardProjectsPage.dates}>
            <Calendar className="size-3" />
            <span>
              {format(new Date(project.startDate), "MMM d, yyyy")}
              {project.endDate && ` - ${format(new Date(project.endDate), "MMM d, yyyy")}`}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.ministries.slice(0, 2).map((ministry) => (
              <Badge key={ministry} variant="secondary" className="text-xs">
                {ministry}
              </Badge>
            ))}
            {project.ministries.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{project.ministries.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
