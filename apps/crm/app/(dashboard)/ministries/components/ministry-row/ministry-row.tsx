import type { MinistryListItemDto } from "@ancla/contracts";
import Link from "next/link";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { stateLabel, stateTone } from "@/components/editorial/editorial-status-bar";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { DESTINATION_LABELS } from "../../data/ministryLabels";

const ministryRowMinistriesPage = {
  container: cn(
    "flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)] focus-visible:bg-[var(--oro-50)]",
  ),
  main: cn("flex min-w-0 flex-1 basis-60 flex-col gap-0.5"),
  title: cn("truncate text-[15px] font-bold"),
  untitled: cn("font-normal text-[var(--tinta-apagada)]"),
  meta: cn("truncate text-[12.5px] text-[var(--tinta-apagada)]"),
  states: cn("flex flex-wrap items-center gap-1.5"),
  destination: cn("w-28 text-[13px] text-[var(--tinta-suave)]"),
  landing: cn("w-24 text-[13px] text-[var(--tinta-suave)]"),
};

interface MinistryRowProps {
  ministry: MinistryListItemDto;
  categoryName: string | undefined;
}

/** One ministry of the list: names, category, editorial state, destination and landing. */
export function MinistryRow({ ministry, categoryName }: MinistryRowProps) {
  const { live, working } = ministry;
  const hasPublicTitle = ministry.title !== null;
  return (
    <Link
      className={ministryRowMinistriesPage.container}
      data-testid="ministry-row"
      href={getChurchRoutePath("ministries", ministry.id)}
    >
      <span className={ministryRowMinistriesPage.main}>
        <span
          className={cn(
            ministryRowMinistriesPage.title,
            !hasPublicTitle && ministryRowMinistriesPage.untitled,
          )}
        >
          {ministry.title ?? ministry.name}
        </span>
        <span className={ministryRowMinistriesPage.meta}>
          {[categoryName, hasPublicTitle ? ministry.name : null].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className={ministryRowMinistriesPage.states}>
        {live ? (
          <StatusPill tone={stateTone(live.state)}>{stateLabel(live.state)}</StatusPill>
        ) : null}
        {working ? (
          <StatusPill tone={stateTone(working.state)}>
            {live ? `Nueva versión: ${stateLabel(working.state)}` : stateLabel(working.state)}
          </StatusPill>
        ) : null}
        {live || working ? null : <StatusPill tone="ink">Borrador</StatusPill>}
      </span>
      <span className={ministryRowMinistriesPage.destination}>
        {DESTINATION_LABELS[ministry.destination]}
      </span>
      <span className={ministryRowMinistriesPage.landing}>
        {ministry.showOnLanding ? "Sí" : "No"}
      </span>
    </Link>
  );
}
