import type { SimplePageListItemDto } from "@ancla/contracts";
import Link from "next/link";
import { StatusPill } from "@/components/dashboard/board/status-pill";
import { stateLabel, stateTone } from "@/components/editorial/editorial-status-bar";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const pageRowWebsitePage = {
  container: cn(
    "flex items-center gap-4 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)] focus-visible:bg-[var(--oro-50)]",
  ),
  title: cn("min-w-0 flex-1 truncate text-[15px] font-bold"),
  untitled: cn("font-normal text-[var(--tinta-apagada)]"),
  states: cn("flex flex-wrap items-center gap-1.5"),
};

interface PageRowProps {
  page: SimplePageListItemDto;
}

/** One page of the list: its title and where it stands in the editorial workflow. */
export function PageRow({ page }: PageRowProps) {
  const { live, working } = page;
  return (
    <Link
      className={pageRowWebsitePage.container}
      href={getChurchRoutePath("website", "pages", page.id)}
    >
      <span className={cn(pageRowWebsitePage.title, !page.title && pageRowWebsitePage.untitled)}>
        {page.title ?? "Sin título"}
      </span>
      <span className={pageRowWebsitePage.states}>
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
    </Link>
  );
}
