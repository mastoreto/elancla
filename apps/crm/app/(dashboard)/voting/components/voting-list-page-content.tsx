"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import {
  formatVotingDate,
  getVotingOutcome,
  majorityTypeLabels,
  votingTypeLabels,
} from "../voting-config";
import {
  getVotingCreatePath,
  getVotingDetailPath,
  getVotingModeratorPath,
  getVotingResultsPath,
  getVotingVotePath,
} from "../voting-routes";
import { VotingMetricCard } from "./voting-metric-card";
import { VotingStatusBadge } from "./voting-status-badge";

const styles = {
  page: cn("space-y-6"),
  header: cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"),
  title: cn("text-2xl font-semibold tracking-tight text-foreground"),
  description: cn("max-w-2xl text-sm leading-6 text-muted-foreground"),
  metrics: cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4"),
  list: cn("grid gap-4"),
  card: cn("overflow-hidden border-border/70 bg-card shadow-sm"),
  summaryRow: cn("grid gap-3 text-sm text-muted-foreground sm:grid-cols-3"),
  summaryLabel: cn("mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"),
  progressWrap: cn("space-y-3"),
  progressLabel: cn("flex items-center justify-between text-sm text-muted-foreground"),
  actions: cn("flex flex-wrap gap-2"),
  optionList: cn("flex flex-wrap gap-2"),
  optionPill: cn("rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"),
  emptyCard: cn("border-dashed"),
};

export function VotingListPageContent() {
  const { votings } = useVotingCollection({ live: true });
  const draftCount = votings.filter((voting) => voting.status === "draft").length;
  const openCount = votings.filter((voting) => voting.status === "open").length;
  const closedCount = votings.filter((voting) => voting.status === "closed").length;
  const liveVotes = votings.reduce((sum, voting) => sum + voting.votesSubmitted, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="space-y-2">
          <h1 className={styles.title}>Votaciones de asamblea</h1>
          <p className={styles.description}>
            Centro de control para sesiones de votación en tiempo real. El estado se actualiza
            localmente con simulación de participación y conserva los cambios del navegador.
          </p>
        </div>

        <Button className="w-full sm:w-auto" asChild={true}>
          <Link href={getVotingCreatePath()}>
            <Plus className="size-4" />
            Crear votación
          </Link>
        </Button>
      </div>

      <div className={styles.metrics}>
        <VotingMetricCard
          label="Borradores"
          value={String(draftCount)}
          hint="Preparadas para revisión del moderador."
          icon={Clock3}
        />
        <VotingMetricCard
          label="Abiertas"
          value={String(openCount)}
          hint="Con avance en tiempo real y quorum visible."
          icon={Activity}
        />
        <VotingMetricCard
          label="Cerradas"
          value={String(closedCount)}
          hint="Listas para lectura final y archivo."
          icon={CheckCircle2}
        />
        <VotingMetricCard
          label="Votos registrados"
          value={String(liveVotes)}
          hint="Suma acumulada de esta demo de frontend."
          icon={Vote}
        />
      </div>

      <div className={styles.list}>
        {votings.map((voting) => {
          const outcome = getVotingOutcome(voting);
          const voteProgress =
            voting.presentUsers === 0 ? 0 : (voting.votesSubmitted / voting.presentUsers) * 100;

          return (
            <Card key={voting.id} className={styles.card}>
              <CardHeader>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <VotingStatusBadge status={voting.status} />
                    <span className={styles.optionPill}>{votingTypeLabels[voting.type]}</span>
                    <span className={styles.optionPill}>
                      {majorityTypeLabels[voting.majorityType]}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-xl">{voting.title}</CardTitle>
                    <CardDescription className="max-w-3xl leading-6">
                      {voting.summary}
                    </CardDescription>
                  </div>
                </div>

                <CardAction>
                  <Button variant="outline" asChild={true}>
                    <Link href={getVotingDetailPath(voting.id)}>
                      Ver resumen
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className={styles.summaryRow}>
                  <div>
                    <p className={styles.summaryLabel}>Quorum</p>
                    <p className="text-foreground">
                      {voting.presentUsers}/{voting.quorum} presentes
                    </p>
                  </div>
                  <div>
                    <p className={styles.summaryLabel}>Votos emitidos</p>
                    <p className="text-foreground">
                      {voting.votesSubmitted} de {Math.max(voting.presentUsers, 1)} presentes
                    </p>
                  </div>
                  <div>
                    <p className={styles.summaryLabel}>Actualización</p>
                    <p className="text-foreground">{formatVotingDate(voting.updatedAt)}</p>
                  </div>
                </div>

                <div className={styles.progressWrap}>
                  <div>
                    <div className={styles.progressLabel}>
                      <span>Avance de quorum</span>
                      <span>{Math.round(outcome.quorumProgress)}%</span>
                    </div>
                    <Progress value={outcome.quorumProgress} className="mt-2 h-3" />
                  </div>

                  <div>
                    <div className={styles.progressLabel}>
                      <span>Participación sobre presentes</span>
                      <span>{Math.round(voteProgress)}%</span>
                    </div>
                    <Progress value={voteProgress} className="mt-2 h-3" />
                  </div>
                </div>

                <div className={styles.optionList}>
                  {voting.options.map((option) => (
                    <span key={option.id} className={styles.optionPill}>
                      {option.label}: {option.votes}
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className={styles.actions}>
                <Button variant="outline" asChild={true}>
                  <Link href={getVotingModeratorPath(voting.id)}>
                    <ShieldCheck className="size-4" />
                    Moderar
                  </Link>
                </Button>

                <Button variant="outline" asChild={true}>
                  <Link href={getVotingVotePath(voting.id)}>
                    <Users className="size-4" />
                    Ir a votar
                  </Link>
                </Button>

                {voting.status === "closed" ? (
                  <Button asChild={true}>
                    <Link href={getVotingResultsPath(voting.id)}>
                      <BarChart3 className="size-4" />
                      Ver resultados
                    </Link>
                  </Button>
                ) : (
                  <Button disabled={true}>
                    <BarChart3 className="size-4" />
                    Resultados al cerrar
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {votings.length === 0 ? (
          <Card className={cn(styles.card, styles.emptyCard)}>
            <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
              <Vote className="size-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">No hay votaciones cargadas</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Crea una nueva sesión para habilitar el panel de moderación y el flujo de voto.
                </p>
              </div>
              <Button asChild={true}>
                <Link href={getVotingCreatePath()}>Crear primera votación</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
