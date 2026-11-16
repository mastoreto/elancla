"use client";

import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { BudgetProgressBar } from "@/components/budget-progress-bar";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChurchRoutePath } from "@/lib/church";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectTableProps {
  projects: Project[];
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectTable({ projects }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <ExternalLink className="size-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No hay proyectos encontrados</h3>
        <p className="text-sm text-muted-foreground max-w-[250px]">
          Intenta ajustando tus filtros o crea un nuevo proyecto
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Proyecto</TableHead>
            <TableHead className="font-semibold">Ministerio</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Progreso de Presupuesto</TableHead>
            <TableHead className="font-semibold text-right">Presupuesto</TableHead>
            <TableHead className="font-semibold text-right">Gastado</TableHead>
            <TableHead className="font-semibold text-right">Disponible</TableHead>
            <TableHead className="font-semibold">Cronograma</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const remaining = project.budget - project.spent;
            const isOverBudget = remaining < 0;

            return (
              <TableRow key={project.id} className="group">
                <TableCell>
                  <Link
                    href={getChurchRoutePath("projects", project.id)}
                    className="font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
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
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell className="w-[180px]">
                  <BudgetProgressBar
                    budget={project.budget}
                    spent={project.spent}
                    currency={project.currency}
                    showLabels={false}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  <Badge variant="secondary" className="font-mono">
                    {formatCurrency(project.budget, project.currency)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-expense font-medium">
                    {formatCurrency(project.spent, project.currency)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn("font-medium", isOverBudget ? "text-expense" : "text-income")}
                  >
                    {formatCurrency(remaining, project.currency)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(project.startDate), "MMM d")}
                    {project.endDate && ` - ${format(new Date(project.endDate), "MMM d")}`}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild={true}
                  >
                    <Link href={getChurchRoutePath("projects", project.id)}>
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
