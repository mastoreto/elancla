"use client";

import { AlertTriangle, BarChart3, ShieldCheck, Users, Vote } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import { getTotalVotes, getVotingOutcome } from "../voting-config";
import { getVotingModeratorPath, getVotingResultsPath, getVotingVotePath } from "../voting-routes";
import { VotingMetricCard } from "./voting-metric-card";
import { VotingPageShell } from "./voting-page-shell";

const votingOverviewPageContentVotingPage = {
  block: cn("flex items-center justify-between text-sm text-muted-foreground"),
  text: cn("text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"),
  blockBorder: cn(
    "rounded-xl border border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground",
  ),
  content: cn("space-y-6"),
  grid: cn("grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]"),
  section: cn("space-y-4"),
  optionRow: cn(
    "flex items-center justify-between rounded-xl border border-border/70 bg-muted/10 px-4 py-3",
  ),
  optionLabel: cn("text-sm font-medium text-foreground"),
  optionVotes: cn("text-sm text-muted-foreground"),
  alert: cn("border-oro bg-warning-surface text-warning"),
  actionCard: cn("border-border/70 bg-card shadow-sm"),
  actionButtons: cn("flex flex-col gap-3"),
};

export function VotingOverviewPageContent({ votingId }: { votingId: string }) {
  const { votings } = useVotingCollection({ live: true });
  const voting = votings.find((currentVoting) => currentVoting.id === votingId) ?? null;
  const outcome = voting ? getVotingOutcome(voting) : null;

  return (
    <VotingPageShell voting={voting} activeView="overview">
      {voting && outcome ? (
        <div className={votingOverviewPageContentVotingPage.content}>
          {voting.status === "draft" ? (
            <Alert className={votingOverviewPageContentVotingPage.alert}>
              <AlertTriangle className="size-4" />
              <AlertTitle>Pendiente de apertura</AlertTitle>
              <AlertDescription>
                La sesión todavía no está disponible para la asamblea. Revisa opciones, quorum y
                mayoría antes de abrirla desde moderación.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <VotingMetricCard
              label="Presentes"
              value={String(voting.presentUsers)}
              hint={`Quorum mínimo: ${voting.quorum}`}
              icon={Users}
            />
            <VotingMetricCard
              label="Votos emitidos"
              value={String(voting.votesSubmitted)}
              hint="Actualización simulada en tiempo real."
              icon={Vote}
            />
            <VotingMetricCard
              label="Resultado estimado"
              value={outcome.resultLabel}
              hint={outcome.thresholdLabel}
              icon={BarChart3}
            />
          </div>

          <div className={votingOverviewPageContentVotingPage.grid}>
            <Card className={votingOverviewPageContentVotingPage.actionCard}>
              <CardHeader>
                <CardTitle>Estado operativo</CardTitle>
              </CardHeader>
              <CardContent className={votingOverviewPageContentVotingPage.section}>
                <div>
                  <div className={votingOverviewPageContentVotingPage.block}>
                    <span>Quorum alcanzado</span>
                    <span>{Math.round(outcome.quorumProgress)}%</span>
                  </div>
                  <Progress value={outcome.quorumProgress} className="mt-2 h-3" />
                </div>

                <div>
                  <div className={votingOverviewPageContentVotingPage.block}>
                    <span>Participación sobre presentes</span>
                    <span>{Math.round(outcome.participationRate)}%</span>
                  </div>
                  <Progress value={outcome.participationRate} className="mt-2 h-3" />
                </div>

                <div className="space-y-3">
                  <p className={votingOverviewPageContentVotingPage.text}>Distribución actual</p>

                  {voting.options.map((option) => (
                    <div key={option.id} className={votingOverviewPageContentVotingPage.optionRow}>
                      <span className={votingOverviewPageContentVotingPage.optionLabel}>
                        {option.label}
                      </span>
                      <span className={votingOverviewPageContentVotingPage.optionVotes}>
                        {option.votes} votos
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={votingOverviewPageContentVotingPage.actionCard}>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className={votingOverviewPageContentVotingPage.actionButtons}>
                <Button className="w-full justify-start" asChild={true}>
                  <Link href={getVotingModeratorPath(voting.id)}>
                    <ShieldCheck className="size-4" />
                    Abrir panel de moderación
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start" asChild={true}>
                  <Link href={getVotingVotePath(voting.id)}>
                    <Users className="size-4" />
                    Abrir pantalla de voto
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={voting.status !== "closed"}
                  asChild={voting.status === "closed"}
                >
                  {voting.status === "closed" ? (
                    <Link href={getVotingResultsPath(voting.id)}>
                      <BarChart3 className="size-4" />
                      Ver resultados finales
                    </Link>
                  ) : (
                    <>
                      <BarChart3 className="size-4" />
                      Resultados disponibles al cerrar
                    </>
                  )}
                </Button>

                <div className={votingOverviewPageContentVotingPage.blockBorder}>
                  Total contabilizado: {getTotalVotes(voting)} voto
                  {getTotalVotes(voting) === 1 ? "" : "s"}.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </VotingPageShell>
  );
}
