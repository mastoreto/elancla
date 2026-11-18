"use client";

import { Activity, CheckCircle2, Lock, Play, Users, Vote } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import { formatVotingDate, getVotingOutcome } from "../voting-config";
import { getVotingResultsPath, getVotingVotePath } from "../voting-routes";
import { VotingMetricCard } from "./voting-metric-card";
import { VotingPageShell } from "./voting-page-shell";

const votingModeratorPageContentVotingPage = {
  page: cn("space-y-6"),
  grid: cn("grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]"),
  panel: cn("border-border/70 bg-card shadow-sm"),
  section: cn("space-y-5"),
  statGrid: cn("grid gap-4 md:grid-cols-3"),
  kpi: cn("space-y-2"),
  kpiLabel: cn("flex items-center justify-between text-sm text-muted-foreground"),
  feed: cn("space-y-3"),
  feedItem: cn("rounded-xl border border-border/70 bg-muted/10 p-4"),
  feedTitle: cn("text-sm font-medium text-foreground"),
  feedCopy: cn("mt-1 text-sm text-muted-foreground"),
  actionGroup: cn("flex flex-col gap-3"),
};

export function VotingModeratorPageContent({ votingId }: { votingId: string }) {
  const { votings, updateVotingStatus } = useVotingCollection({ live: true });
  const voting = votings.find((currentVoting) => currentVoting.id === votingId) ?? null;
  const outcome = voting ? getVotingOutcome(voting) : null;

  return (
    <VotingPageShell voting={voting} activeView="moderator">
      {voting && outcome ? (
        <div className={votingModeratorPageContentVotingPage.page}>
          <Alert>
            <Activity className="size-4" />
            <AlertTitle>Modo moderación en vivo</AlertTitle>
            <AlertDescription>
              Los presentes y votos emitidos se simulan cada 2.4 segundos mientras la votación esté
              abierta.
            </AlertDescription>
          </Alert>

          <div className={votingModeratorPageContentVotingPage.statGrid}>
            <VotingMetricCard
              label="Habilitados"
              value={String(voting.enabledUsers)}
              hint="Padrón activo para esta sesión."
              icon={Users}
            />
            <VotingMetricCard
              label="Presentes"
              value={String(voting.presentUsers)}
              hint={`Faltan ${Math.max(voting.quorum - voting.presentUsers, 0)} para quorum.`}
              icon={CheckCircle2}
            />
            <VotingMetricCard
              label="Votos emitidos"
              value={String(voting.votesSubmitted)}
              hint={`Pendientes entre presentes: ${Math.max(voting.presentUsers - voting.votesSubmitted, 0)}.`}
              icon={Vote}
            />
          </div>

          <div className={votingModeratorPageContentVotingPage.grid}>
            <Card className={votingModeratorPageContentVotingPage.panel}>
              <CardHeader>
                <CardTitle>Control de la sesión</CardTitle>
              </CardHeader>
              <CardContent className={votingModeratorPageContentVotingPage.section}>
                <div className={votingModeratorPageContentVotingPage.kpi}>
                  <div className={votingModeratorPageContentVotingPage.kpiLabel}>
                    <span>Quorum sobre presentes</span>
                    <span>{Math.round(outcome.quorumProgress)}%</span>
                  </div>
                  <Progress value={outcome.quorumProgress} className="h-3" />
                </div>

                <div className={votingModeratorPageContentVotingPage.kpi}>
                  <div className={votingModeratorPageContentVotingPage.kpiLabel}>
                    <span>Participación efectiva</span>
                    <span>{Math.round(outcome.participationRate)}%</span>
                  </div>
                  <Progress value={outcome.participationRate} className="h-3" />
                </div>

                <div className={votingModeratorPageContentVotingPage.feed}>
                  <div className={votingModeratorPageContentVotingPage.feedItem}>
                    <p className={votingModeratorPageContentVotingPage.feedTitle}>
                      {outcome.quorumReached ? "Quorum cumplido" : "Quorum aún pendiente"}
                    </p>
                    <p className={votingModeratorPageContentVotingPage.feedCopy}>
                      {outcome.quorumReached
                        ? "La sesión ya tiene asistencia suficiente para validar el cierre."
                        : `Aún faltan ${Math.max(voting.quorum - voting.presentUsers, 0)} presentes para completar el quorum.`}
                    </p>
                  </div>

                  <div className={votingModeratorPageContentVotingPage.feedItem}>
                    <p className={votingModeratorPageContentVotingPage.feedTitle}>
                      Actividad reciente
                    </p>
                    <p className={votingModeratorPageContentVotingPage.feedCopy}>
                      Última actualización registrada: {formatVotingDate(voting.updatedAt)}.
                    </p>
                  </div>

                  <div className={votingModeratorPageContentVotingPage.feedItem}>
                    <p className={votingModeratorPageContentVotingPage.feedTitle}>
                      Resultado proyectado
                    </p>
                    <p className={votingModeratorPageContentVotingPage.feedCopy}>
                      Con el estado actual, la sesión se cerraría como{" "}
                      {outcome.resultLabel.toLowerCase()}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={votingModeratorPageContentVotingPage.panel}>
              <CardHeader>
                <CardTitle>Acciones del moderador</CardTitle>
              </CardHeader>
              <CardContent className={votingModeratorPageContentVotingPage.actionGroup}>
                <Button
                  className="w-full justify-start"
                  onClick={() => updateVotingStatus(voting.id, "open")}
                  disabled={voting.status !== "draft"}
                >
                  <Play className="size-4" />
                  Abrir votación
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => updateVotingStatus(voting.id, "closed")}
                  disabled={voting.status !== "open"}
                >
                  <Lock className="size-4" />
                  Cerrar votación
                </Button>

                <Button variant="outline" className="w-full justify-start" asChild={true}>
                  <Link href={getVotingVotePath(voting.id)}>
                    <Users className="size-4" />
                    Abrir vista de miembro
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
                      <CheckCircle2 className="size-4" />
                      Ir a resultados finales
                    </Link>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Resultados al finalizar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </VotingPageShell>
  );
}
