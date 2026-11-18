import { ArrowLeft, BarChart3, Gavel, ShieldCheck, Vote } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/src/componentes/dashboard";
import type { VotingRecord } from "../types";
import { formatVotingDate, majorityTypeLabels, votingTypeLabels } from "../voting-config";
import {
  getVotingDetailPath,
  getVotingListPath,
  getVotingModeratorPath,
  getVotingResultsPath,
  getVotingVotePath,
} from "../voting-routes";
import { VotingStatusBadge } from "./voting-status-badge";

type VotingView = "overview" | "moderator" | "vote" | "results";

const votingPageShellVotingPage = {
  page: cn("space-y-6"),
  backLink: cn("rounded-full"),
  hero: cn("overflow-hidden border-border/70 bg-card shadow-sm"),
  heroContent: cn("space-y-5 p-6"),
  title: cn("text-2xl font-semibold tracking-tight text-balance text-foreground"),
  description: cn("max-w-3xl text-sm leading-6 text-muted-foreground"),
  facts: cn("grid gap-3 text-sm text-muted-foreground sm:grid-cols-3"),
  factLabel: cn("mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"),
  nav: cn("flex flex-wrap gap-2"),
};

const navigationItems = [
  { key: "overview" as const, label: "Resumen", icon: Gavel },
  { key: "moderator" as const, label: "Moderación", icon: ShieldCheck },
  { key: "vote" as const, label: "Votar", icon: Vote },
  { key: "results" as const, label: "Resultados", icon: BarChart3 },
];

function getNavigationHref(votingId: string, view: VotingView) {
  if (view === "overview") {
    return getVotingDetailPath(votingId);
  }

  if (view === "moderator") {
    return getVotingModeratorPath(votingId);
  }

  if (view === "vote") {
    return getVotingVotePath(votingId);
  }

  return getVotingResultsPath(votingId);
}

export function VotingPageShell({
  voting,
  activeView,
  children,
}: {
  voting: VotingRecord | null;
  activeView: VotingView;
  children: React.ReactNode;
}) {
  if (!voting) {
    return (
      <Card className={votingPageShellVotingPage.hero}>
        <CardContent className={votingPageShellVotingPage.heroContent}>
          <p className={votingPageShellVotingPage.factLabel}>Votación no encontrada</p>
          <h1 className={votingPageShellVotingPage.title}>
            No pudimos cargar esta sesión de votación.
          </h1>
          <p className={votingPageShellVotingPage.description}>
            La URL puede apuntar a un identificador inexistente o a una sesión demo ya descartada.
          </p>
          <Button asChild={true}>
            <Link href={getVotingListPath()}>Volver al listado</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={votingPageShellVotingPage.page}>
      <DashboardPageHeader
        actions={
          <>
            <VotingStatusBadge status={voting.status} />
            <Button asChild={true} className={votingPageShellVotingPage.backLink} variant="outline">
              <Link href={getVotingListPath()}>
                <ArrowLeft aria-hidden="true" />
                Volver a votaciones
              </Link>
            </Button>
          </>
        }
        description={voting.summary}
        kicker="Gobierno"
        title={voting.title}
      />

      <Card className={votingPageShellVotingPage.hero}>
        <CardContent className={votingPageShellVotingPage.heroContent}>
          <div className={votingPageShellVotingPage.facts}>
            <div>
              <p className={votingPageShellVotingPage.factLabel}>Tipo</p>
              <p>{votingTypeLabels[voting.type]}</p>
            </div>
            <div>
              <p className={votingPageShellVotingPage.factLabel}>Mayoría requerida</p>
              <p>{majorityTypeLabels[voting.majorityType]}</p>
            </div>
            <div>
              <p className={votingPageShellVotingPage.factLabel}>Última actualización</p>
              <p>{formatVotingDate(voting.updatedAt)}</p>
            </div>
          </div>

          <div className={votingPageShellVotingPage.nav}>
            {navigationItems.map((item) => (
              <Button
                key={item.key}
                variant={activeView === item.key ? "default" : "outline"}
                className={cn("justify-start", activeView === item.key && "shadow-sm")}
                asChild={true}
              >
                <Link href={getNavigationHref(voting.id, item.key)}>
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
