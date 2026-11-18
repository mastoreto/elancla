"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck, Vote } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVotingCollection } from "../use-voting-data";
import { getVotingDetailPath, getVotingResultsPath } from "../voting-routes";
import { VotingPageShell } from "./voting-page-shell";

const styles = {
  page: cn("grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]"),
  ballot: cn("border-border/70 bg-card shadow-sm"),
  options: cn("grid gap-4"),
  optionButton: cn(
    "flex min-h-24 w-full items-center justify-between rounded-2xl border border-border/70 bg-card px-5 py-5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5",
  ),
  optionButtonActive: cn("border-primary bg-primary/10 shadow-sm"),
  optionTitle: cn("text-lg font-semibold text-foreground"),
  optionHint: cn("mt-1 text-sm text-muted-foreground"),
  sidePanel: cn("space-y-4"),
  actionCard: cn("border-border/70 bg-card/90 shadow-sm"),
  helper: cn("text-sm leading-6 text-muted-foreground"),
};

export function VotingVotePageContent({ votingId }: { votingId: string }) {
  const { votings, castViewerVote } = useVotingCollection({ live: true });
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const voting = votings.find((currentVoting) => currentVoting.id === votingId) ?? null;
  const selectedOption = useMemo(
    () => voting?.options.find((option) => option.id === selectedOptionId) ?? null,
    [selectedOptionId, voting],
  );

  const canVote = voting?.status === "open" && voting.viewerEnabled && !voting.viewerVoteOptionId;
  const recordedOption =
    voting?.options.find((option) => option.id === voting.viewerVoteOptionId) ?? null;

  return (
    <VotingPageShell voting={voting} activeView="vote">
      {voting ? (
        <div className={styles.page}>
          <Card className={styles.ballot}>
            <CardHeader>
              <CardTitle className="text-2xl">Pantalla de votación</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {voting.status === "open" ? null : (
                <Alert>
                  <AlertTriangle className="size-4" />
                  <AlertTitle>
                    {voting.status === "closed" ? "Votación cerrada" : "Votación no iniciada"}
                  </AlertTitle>
                  <AlertDescription>
                    {voting.status === "closed"
                      ? "Esta sesión ya fue cerrada por moderación. El voto ya no admite cambios."
                      : "La asamblea todavía no puede emitir su voto en esta sesión."}
                  </AlertDescription>
                </Alert>
              )}

              {voting.status === "open" && !voting.viewerEnabled ? (
                <Alert>
                  <AlertTriangle className="size-4" />
                  <AlertTitle>No habilitado para votar</AlertTitle>
                  <AlertDescription>
                    Tu perfil no figura como habilitado en esta sesión demo. El sistema bloquea el
                    envío antes de mostrar la confirmación final.
                  </AlertDescription>
                </Alert>
              ) : null}

              {recordedOption ? (
                <Alert>
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>Tu voto ya fue registrado</AlertTitle>
                  <AlertDescription>
                    Se guardó de forma anónima con la opción <strong>{recordedOption.label}</strong>
                    .
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <ShieldCheck className="size-4" />
                    <AlertTitle>Voto anónimo</AlertTitle>
                    <AlertDescription>
                      Selecciona una opción y confirma. El flujo completo requiere un máximo de dos
                      clics.
                    </AlertDescription>
                  </Alert>

                  <div className={styles.options}>
                    {voting.options.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        className={cn(
                          styles.optionButton,
                          selectedOptionId === option.id && styles.optionButtonActive,
                        )}
                        onClick={() => setSelectedOptionId(option.id)}
                        disabled={!canVote}
                      >
                        <div>
                          <p className={styles.optionTitle}>{option.label}</p>
                          <p className={styles.optionHint}>Toca para seleccionar esta opción.</p>
                        </div>
                        <Vote className="size-5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className={styles.sidePanel}>
            <Card className={styles.actionCard}>
              <CardHeader>
                <CardTitle>Confirmación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recordedOption ? (
                  <>
                    <p className={styles.helper}>
                      Ya no se requieren más acciones para este miembro. Puedes volver al resumen o
                      revisar resultados cuando la sesión se cierre.
                    </p>
                    <Button className="w-full" variant="outline" asChild={true}>
                      <Link href={getVotingDetailPath(voting.id)}>Volver al resumen</Link>
                    </Button>
                    <Button
                      className="w-full"
                      disabled={voting.status !== "closed"}
                      asChild={voting.status === "closed"}
                    >
                      {voting.status === "closed" ? (
                        <Link href={getVotingResultsPath(voting.id)}>Ir a resultados</Link>
                      ) : (
                        <>Resultados al cerrar</>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className={styles.helper}>
                      {selectedOption
                        ? `Confirmarás la opción "${selectedOption.label}".`
                        : "Primero selecciona una opción para habilitar la confirmación."}
                    </p>

                    <Button
                      className="w-full"
                      disabled={!selectedOption || !canVote}
                      onClick={() => {
                        if (!selectedOption) {
                          return;
                        }

                        castViewerVote(voting.id, selectedOption.id);
                      }}
                    >
                      Confirmar voto
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </VotingPageShell>
  );
}
