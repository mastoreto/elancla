"use client";

import { format } from "date-fns";
import { Calendar, Check, PiggyBank, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BudgetProgressBar } from "./budget-progress-bar";

const projectSummaryProjectsPage = {
  cardValue: cn("text-2xl font-bold"),
  metricIcon: cn("flex size-11 shrink-0 items-center justify-center rounded-xl"),
  fieldLabel: cn("mb-1 text-sm font-medium text-muted-foreground"),
  label: cn("text-sm font-medium text-muted-foreground"),
  stepTrack: cn("absolute left-0 right-0 top-5 h-1 rounded-full bg-muted"),
  stepProgress: cn("absolute left-0 top-5 h-1 rounded-full bg-accent transition-all duration-500"),
  infoCard: cn("flex items-center gap-3 rounded-xl border bg-muted/20 p-4"),
  infoIcon: cn("flex size-10 items-center justify-center rounded-lg bg-muted"),
  sectionLabel: cn("mb-3 text-sm font-medium text-muted-foreground"),
  cardHeader: cn("mb-4 flex items-start justify-between gap-4"),
};

interface ProjectSummaryProps {
  project: Project;
  totalIncome: number;
  totalExpenses: number;
}

const projectStages = [
  {
    key: "planning",
    label: "Planificación",
    description: "Definición del alcance y presupuesto",
  },
  {
    key: "execution",
    label: "Ejecución",
    description: "Seguimiento operativo y financiero",
  },
  {
    key: "closure",
    label: "Cierre",
    description: "Revisión final y consolidación",
  },
] as const;

const currentStageByStatus: Record<Project["status"], number> = {
  planning: 0,
  in_progress: 1,
  finished: 2,
  closed: 2,
};

const progressWidthByStatus: Record<Project["status"], number> = {
  planning: 0,
  in_progress: 50,
  finished: 100,
  closed: 100,
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectSummary({ project, totalIncome, totalExpenses }: ProjectSummaryProps) {
  const currentStage = currentStageByStatus[project.status];
  const progressWidth = progressWidthByStatus[project.status];
  const availableBudget = project.budget - project.spent;
  const summaryCards = [
    {
      label: "Presupuesto",
      value: formatCurrency(project.budget, project.currency),
      icon: Wallet,
      iconClassName: "text-secondary-foreground bg-secondary",
      valueClassName: "text-foreground",
    },
    {
      label: "Ingresos Totales",
      value: `+${formatCurrency(totalIncome, project.currency)}`,
      icon: TrendingUp,
      iconClassName: "text-income bg-income/10",
      valueClassName: "text-income",
    },
    {
      label: "Gastos Totales",
      value: `-${formatCurrency(totalExpenses, project.currency)}`,
      icon: TrendingDown,
      iconClassName: "text-expense bg-expense/10",
      valueClassName: "text-expense",
    },
    {
      label: "Disponible",
      value: formatCurrency(availableBudget, project.currency),
      icon: PiggyBank,
      iconClassName: "text-warning bg-warning-surface",
      valueClassName: "text-foreground",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Resumen del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {project.description && (
            <div>
              <h4 className={projectSummaryProjectsPage.fieldLabel}>Descripción</h4>
              <p className="text-foreground">{project.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className={projectSummaryProjectsPage.label}>Etapas del Proyecto</h4>
              <p className="text-sm text-muted-foreground">
                Seguimiento del avance desde planificación hasta cierre.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="relative pt-1">
                <div className={projectSummaryProjectsPage.stepTrack} />
                <div
                  className={projectSummaryProjectsPage.stepProgress}
                  style={{ width: `${progressWidth}%` }}
                />

                <div className="relative grid grid-cols-3 gap-4">
                  {projectStages.map((stage, index) => {
                    const isClosed = project.status === "closed";
                    const isCompleted = isClosed || index < currentStage;
                    const isCurrent = !isClosed && index === currentStage;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center">
                        <div
                          className={cn(
                            "mb-3 flex size-10 items-center justify-center rounded-full border-2 bg-background text-sm font-semibold transition-colors",
                            isCompleted && "border-accent bg-accent text-accent-foreground",
                            isCurrent && "border-accent text-accent",
                            !isCompleted && !isCurrent && "border-border text-muted-foreground",
                          )}
                        >
                          {isCompleted ? <Check className="size-4" /> : index + 1}
                        </div>
                        <p className="font-medium text-foreground">{stage.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              {projectStages.map((stage, index) => {
                const isClosed = project.status === "closed";
                const isCompleted = isClosed || index < currentStage;
                const isCurrent = !isClosed && index === currentStage;

                return (
                  <div
                    key={stage.key}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4",
                      isCurrent && "border-accent/40 bg-accent/5",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                        isCompleted && "border-accent bg-accent text-accent-foreground",
                        isCurrent && "border-accent text-accent",
                        !isCompleted && !isCurrent && "border-border text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="size-4" /> : index + 1}
                    </div>

                    <div>
                      <p className="font-medium text-foreground">{stage.label}</p>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={projectSummaryProjectsPage.infoCard}>
              <div className={projectSummaryProjectsPage.infoIcon}>
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {project.ministries.length === 1 ? "Ministerio" : "Ministerios"}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {project.ministries.map((ministry) => (
                    <Badge key={ministry} variant="secondary">
                      {ministry}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className={projectSummaryProjectsPage.infoCard}>
              <div className={projectSummaryProjectsPage.infoIcon}>
                <Calendar className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cronograma</p>
                <p className="font-medium text-foreground">
                  {format(new Date(project.startDate), "MMM d, yyyy")}
                  {project.endDate && ` - ${format(new Date(project.endDate), "MMM d, yyyy")}`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className={projectSummaryProjectsPage.sectionLabel}>Progreso de Presupuesto</h4>
            <BudgetProgressBar
              budget={project.budget}
              spent={project.spent}
              currency={project.currency}
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label}>
              <CardContent className="pt-6">
                <div className={projectSummaryProjectsPage.cardHeader}>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={cn(projectSummaryProjectsPage.cardValue, card.valueClassName)}>
                      {card.value}
                    </p>
                  </div>

                  <div className={cn(projectSummaryProjectsPage.metricIcon, card.iconClassName)}>
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
