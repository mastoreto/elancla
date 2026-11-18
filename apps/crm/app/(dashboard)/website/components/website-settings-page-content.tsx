import { Globe } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";
import { AboutSection } from "./about-section";
import { SiteStatusSection } from "./site-status-section";
import { SocialLinksSection } from "./social-links-section";

export type SiteStatusValue = "online" | "maintenance" | "closed";

export type SocialLinks = {
  website: string;
  instagram: string;
  youtube: string;
  facebook: string;
  twitter: string;
  spotify: string;
  linkedin: string;
};

export type WebsiteSettingsProps = {
  initialStatus: SiteStatusValue;
  initialSocial: SocialLinks;
  initialAbout: string;
};

const PUBLIC_SITE_URL = "https://elancla.uy";

const websiteSettingsPage = {
  container: cn("flex flex-col gap-[18px]"),
  intro: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  columns: cn("grid items-start gap-[18px] lg:grid-cols-[1fr_1.3fr]"),
  icon: cn("size-4"),
};

/** HTML saved by the previous rich-text editor reads as plain text in the board's textarea. */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function WebsiteSettingsPageContent({
  initialStatus,
  initialSocial,
  initialAbout,
}: WebsiteSettingsProps) {
  return (
    <div className={websiteSettingsPage.container}>
      <div className={websiteSettingsPage.intro}>
        <span className={websiteSettingsPage.description}>
          Gestiona cómo se ve y se comporta el sitio público de la iglesia.
        </span>
        <BoardButton href={PUBLIC_SITE_URL} rel="noreferrer" target="_blank">
          <Globe aria-hidden="true" className={websiteSettingsPage.icon} />
          Ver sitio
        </BoardButton>
      </div>
      <SiteStatusSection initialStatus={initialStatus} />
      <div className={websiteSettingsPage.columns}>
        <AboutSection initialContent={stripTags(initialAbout)} />
        <SocialLinksSection initialLinks={initialSocial} />
      </div>
    </div>
  );
}
