"use client";

import { AlertTriangle, BarChart3, CheckCircle2, Users, Vote } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import { getVotingOutcome } from "../voting-config";
import { getVotingModeratorPath } from "../voting-routes";
import { VotingMetricCard } from "./voting-metric-card";
import { VotingPageShell } from "./voting-page-shell";

const styles = {
  page: cn("space-y-6"),
  barList: cn("space-y-4"),
  barRow: cn("space-y-2 rounded-2xl border border-border/70 bg-card/70 p-4"),
  barHeader: cn("flex items-center justify-between gap-3"),
  barTitle: cn("text-sm font-medium text-foreground"),
  barValue: cn("text-sm text-muted-foreground"),
  barTrack: cn("h-3 overflow-hidden rounded-full bg-muted"),
  barFill: cn("h-full rounded-full bg-primary transition-all"),
  finalCard: cn("border-border/70 bg-card shadow-sm"),
};

export function VotingResultsPageContent({ votingId }: { votingId: string }) {
  const { votings } = useVotingCollection();
  const voting = votings.find((currentVoting) => currentVoting.id === votingId) ?? null;
  const outcome = voting ? getVotingOutcome(voting) : null;

  return (
    <VotingPageShell voting={voting} activeView="results">
      {voting && outcome ? (
        <div className={styles.page}>
          {voting.status === "closed" ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <VotingMetricCard
                  label="Total de votos"
                  value={String(outcome.totalVotes)}
                  hint="Conteo final emitido por la asamblea."
                  icon={Vote}
                />
                <VotingMetricCard
                  label="Presentes"
                  value={String(voting.presentUsers)}
                  hint={`Quorum ${outcome.quorumReached ? "cumplido" : "incompleto"}.`}
                  icon={Users}
                />
                <VotingMetricCard
                  label="Resultado final"
                  value={outcome.resultLabel}
                  hint={outcome.thresholdLabel}
                  icon={CheckCircle2}
                />
              </div>

              <Card className={styles.finalCard}>
                <CardHeader>
                  <CardTitle>Detalle por opción</CardTitle>
                </CardHeader>
                <CardContent className={styles.barList}>
                  {voting.options.map((option) => {
                    const percentage =
                      outcome.totalVotes === 0 ? 0 : (option.votes / outcome.totalVotes) * 100;

                    return (
                      <div key={option.id} className={styles.barRow}>
                        <div className={styles.barHeader}>
                          <span className={styles.barTitle}>{option.label}</span>
                          <span className={styles.barValue}>
                            {option.votes} votos · {Math.round(percentage)}%
                          </span>
                        </div>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className={styles.finalCard}>
                <CardHeader>
                  <CardTitle>Lectura final</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Resultado oficial:{" "}
                    <strong className="text-foreground">{outcome.resultLabel}</strong>.
                  </p>
                  <p>
                    Opción líder:{" "}
                    <strong className="text-foreground">
                      {outcome.leadingOption?.label ?? "Sin datos"}
                    </strong>
                    .
                  </p>
                  <p>
                    Participación final:{" "}
                    <strong className="text-foreground">
                      {Math.round(outcome.participationRate)}%
                    </strong>
                    .
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertTitle>Resultados bloqueados</AlertTitle>
              <AlertDescription>
                Esta vista solo se habilita cuando el moderador cierre la votación.
              </AlertDescription>
            </Alert>
          )}

          {voting.status === "closed" ? null : (
            <Button asChild={true}>
              <Link href={getVotingModeratorPath(voting.id)}>
                <BarChart3 className="size-4" />
                Ir a moderación
              </Link>
            </Button>
          )}
        </div>
      ) : null}
    </VotingPageShell>
  );
}
