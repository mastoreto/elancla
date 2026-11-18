import { Image as ImageIcon, Mic, Play } from "lucide-react";
import Link from "next/link";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

type ContentSection = "podcasts" | "sermons";

const contentSectionTabsDashboardPage = {
  group: cn(
    "inline-flex w-fit gap-[3px] rounded-full bg-secondary p-1 shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]",
  ),
  tab: cn(
    "inline-flex items-center gap-[7px] rounded-full px-3.5 py-2 text-[13px] font-bold text-[var(--tinta-apagada)] transition hover:text-foreground",
  ),
  active: cn("bg-card text-foreground shadow-(--sombra)"),
  disabled: cn("cursor-not-allowed opacity-70 hover:text-[var(--tinta-apagada)]"),
  soon: cn("text-[10.5px] font-extrabold tracking-wider text-[var(--oro-texto)] uppercase"),
  icon: cn("size-4"),
};

/** Podcasts / Sermones / Galería switcher shown above the audio-video content lists. */
export function ContentSectionTabs({ current }: { current: ContentSection }) {
  return (
    <nav aria-label="Contenidos" className={contentSectionTabsDashboardPage.group}>
      <Link
        aria-current={current === "podcasts" ? "page" : undefined}
        className={cn(
          contentSectionTabsDashboardPage.tab,
          current === "podcasts" && contentSectionTabsDashboardPage.active,
        )}
        href={getChurchRoutePath("podcasts")}
      >
        <Mic aria-hidden="true" className={contentSectionTabsDashboardPage.icon} />
        Podcasts
      </Link>
      <Link
        aria-current={current === "sermons" ? "page" : undefined}
        className={cn(
          contentSectionTabsDashboardPage.tab,
          current === "sermons" && contentSectionTabsDashboardPage.active,
        )}
        href={getChurchRoutePath("sermons")}
      >
        <Play aria-hidden="true" className={contentSectionTabsDashboardPage.icon} />
        Sermones
      </Link>
      <span
        aria-disabled="true"
        className={cn(
          contentSectionTabsDashboardPage.tab,
          contentSectionTabsDashboardPage.disabled,
        )}
      >
        <ImageIcon aria-hidden="true" className={contentSectionTabsDashboardPage.icon} />
        Galería
        <span className={contentSectionTabsDashboardPage.soon}>Pronto</span>
      </span>
    </nav>
  );
}
