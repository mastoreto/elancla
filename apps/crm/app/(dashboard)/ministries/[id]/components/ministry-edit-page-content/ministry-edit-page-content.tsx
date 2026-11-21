"use client";

import { type EditorialStatusDto, PERMISSIONS } from "@ancla/contracts";
import { useAccess } from "@/lib/authz/AccessProvider";
import { canWithAllScope } from "@/lib/authz/can";
import { cn } from "@/lib/utils";
import type { MinistryConfiguration, SiteLocales } from "../../types";
import { MinistryForm } from "../ministry-form";
import { MinistryLeadersCard } from "../ministry-leaders-card";
import { MinistrySettingsCard } from "../ministry-settings-card";

const ministryEditPageContentMinistriesPage = {
  container: cn("flex flex-col gap-[18px]"),
};

interface MinistryEditPageContentProps {
  ministryId: string;
  status: EditorialStatusDto;
  site: SiteLocales;
  /** Only loaded for roles that can configure: the leader of a ministry never gets them. */
  configuration: MinistryConfiguration | null;
}

/** The profile always; the Configuración and Responsables cards only with the all scope. */
export function MinistryEditPageContent({
  ministryId,
  status,
  site,
  configuration,
}: MinistryEditPageContentProps) {
  const access = useAccess();
  const showConfiguration =
    configuration !== null && canWithAllScope(access, PERMISSIONS.ministryProfile.edit);
  return (
    <div className={ministryEditPageContentMinistriesPage.container}>
      <MinistryForm ministryId={ministryId} site={site} status={status} />
      {showConfiguration ? (
        <>
          <MinistrySettingsCard
            categories={configuration.categories}
            defaultLocale={site.defaultLocale}
            // A saved version remounts the card so its fields start from what the server holds.
            key={`settings-${configuration.ministry.version}`}
            ministry={configuration.ministry}
          />
          <MinistryLeadersCard ministryId={ministryId} people={configuration.people} site={site} />
        </>
      ) : null}
    </div>
  );
}
