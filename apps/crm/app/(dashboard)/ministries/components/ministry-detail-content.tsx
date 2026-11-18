import { Calendar, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardPageHeader,
} from "@/src/componentes/dashboard";
import type { MinistryDetail } from "../types";
import { formatMoney, getExecutionPercent, getLeaderInitials } from "../utils/ministry-stats";
import { MinistryDeleteButton } from "./ministry-delete-button";

interface MinistryDetailContentProps {
  ministry: MinistryDetail;
}

const ministryDetailContentMinistriesPage = {
  layout: cn("grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"),
  column: cn("flex flex-col gap-6"),
  action: cn("rounded-full"),
  about: cn("text-sm leading-6 text-tinta-suave"),
  facts: cn("mt-5 grid gap-4 sm:grid-cols-3"),
  factLabel: cn("flex items-center gap-1.5 text-xs text-muted-foreground"),
  factIcon: cn("size-3.5"),
  factValue: cn("mt-1 text-sm font-medium"),
  movementList: cn("divide-y divide-border"),
  movement: cn("flex items-center justify-between gap-3 py-3"),
  movementConcept: cn("text-sm font-medium"),
  movementMeta: cn("text-xs text-muted-foreground"),
  movementAmount: cn("font-mono text-sm tabular-nums"),
  empty: cn("py-6 text-center text-sm text-muted-foreground"),
  person: cn("flex items-center gap-3 py-2"),
  avatar: cn(
    "flex size-9 items-center justify-center rounded-full bg-primary font-display text-sm font-medium text-primary-foreground",
  ),
  personName: cn("text-sm font-semibold"),
  personRole: cn("text-xs text-muted-foreground"),
  budgetFigure: cn("font-display text-2xl font-medium tabular-nums"),
  budgetOf: cn("mb-3 text-xs text-muted-foreground"),
  budgetActions: cn("mt-4 flex flex-wrap gap-2"),
};

function formatMovementAmount(ministry: MinistryDetail, amount: number): string {
  const sign = amount < 0 ? "−" : "+";
  return `${sign} ${formatMoney(ministry.currency, Math.abs(amount))}`;
}

export function MinistryDetailContent({ ministry }: MinistryDetailContentProps) {
  const percent = getExecutionPercent(ministry);

  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <Button asChild={true} className={ministryDetailContentMinistriesPage.action}>
              <Link href={getChurchRoutePath("ministries", ministry.id, "edit")}>
                <Pencil aria-hidden="true" />
                Editar ministerio
              </Link>
            </Button>
            <MinistryDeleteButton ministryName={ministry.name} />
          </>
        }
        description={ministry.description}
        kicker="Ministerio"
        title={ministry.name}
      />

      <div className={ministryDetailContentMinistriesPage.layout}>
        <div className={ministryDetailContentMinistriesPage.column}>
          <DashboardCard>
            <DashboardCardHeader subtitle="Qué hace y cómo se organiza" title="Descripción" />
            <p className={ministryDetailContentMinistriesPage.about}>{ministry.about}</p>
            <dl className={ministryDetailContentMinistriesPage.facts}>
              <div>
                <dt className={ministryDetailContentMinistriesPage.factLabel}>
                  <Calendar
                    aria-hidden="true"
                    className={ministryDetailContentMinistriesPage.factIcon}
                  />
                  Reuniones
                </dt>
                <dd className={ministryDetailContentMinistriesPage.factValue}>
                  {ministry.schedule}
                </dd>
              </div>
              <div>
                <dt className={ministryDetailContentMinistriesPage.factLabel}>Edades</dt>
                <dd className={ministryDetailContentMinistriesPage.factValue}>{ministry.ages}</dd>
              </div>
              <div>
                <dt className={ministryDetailContentMinistriesPage.factLabel}>
                  <Users
                    aria-hidden="true"
                    className={ministryDetailContentMinistriesPage.factIcon}
                  />
                  Voluntarios
                </dt>
                <dd className={ministryDetailContentMinistriesPage.factValue}>
                  {ministry.volunteers} personas
                </dd>
              </div>
            </dl>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader
              subtitle="Gastos asociados al ministerio"
              title="Últimos movimientos"
            />
            {ministry.movements.length === 0 ? (
              <p className={ministryDetailContentMinistriesPage.empty}>
                Todavía no hay movimientos para este ministerio.
              </p>
            ) : (
              <ul className={ministryDetailContentMinistriesPage.movementList}>
                {ministry.movements.map((movement) => (
                  <li className={ministryDetailContentMinistriesPage.movement} key={movement.id}>
                    <div>
                      <p className={ministryDetailContentMinistriesPage.movementConcept}>
                        {movement.concept}
                      </p>
                      <p className={ministryDetailContentMinistriesPage.movementMeta}>
                        {new Date(movement.date).toLocaleDateString("es-UY", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        · {movement.project}
                      </p>
                    </div>
                    <span
                      className={cn(
                        ministryDetailContentMinistriesPage.movementAmount,
                        movement.amount < 0 ? "text-primary" : "text-income",
                      )}
                    >
                      {formatMovementAmount(ministry, movement.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        <div className={ministryDetailContentMinistriesPage.column}>
          <DashboardCard>
            <DashboardCardHeader subtitle="Equipo" title="Liderazgo" />
            <div className={ministryDetailContentMinistriesPage.person}>
              <span aria-hidden="true" className={ministryDetailContentMinistriesPage.avatar}>
                {getLeaderInitials(ministry.leaderName)}
              </span>
              <div>
                <p className={ministryDetailContentMinistriesPage.personName}>
                  {ministry.leaderName}
                </p>
                <p className={ministryDetailContentMinistriesPage.personRole}>
                  Líder · desde {ministry.leaderSince}
                </p>
              </div>
            </div>
            {ministry.coLeaderName ? (
              <div className={ministryDetailContentMinistriesPage.person}>
                <span aria-hidden="true" className={ministryDetailContentMinistriesPage.avatar}>
                  {getLeaderInitials(ministry.coLeaderName)}
                </span>
                <div>
                  <p className={ministryDetailContentMinistriesPage.personName}>
                    {ministry.coLeaderName}
                  </p>
                  <p className={ministryDetailContentMinistriesPage.personRole}>Co-líder</p>
                </div>
              </div>
            ) : null}
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader subtitle="Ejecución del año" title="Presupuesto" />
            <p className={ministryDetailContentMinistriesPage.budgetFigure}>
              {formatMoney(ministry.currency, ministry.executed)}
            </p>
            <p className={ministryDetailContentMinistriesPage.budgetOf}>
              de {formatMoney(ministry.currency, ministry.budget)} asignados
            </p>
            <Progress aria-label={`Presupuesto ejecutado de ${ministry.name}`} value={percent} />
            <div className={ministryDetailContentMinistriesPage.budgetActions}>
              <Button asChild={true} size="sm" variant="outline">
                <Link href={getChurchRoutePath("budgets")}>Ver presupuesto</Link>
              </Button>
              <Button asChild={true} size="sm" variant="outline">
                <Link href={getChurchRoutePath("movements")}>Ver movimientos</Link>
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
