import type { SiteSettingsDto } from "@ancla/contracts";
import { Globe } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { cn } from "@/lib/utils";
import { AddressCard } from "../address-card";
import { GeneralInfoCard } from "../general-info-card";
import { SectionsCard } from "../sections-card";
import { SeoCard } from "../seo-card";
import { SiteStatusCard } from "../site-status-card";
import { SocialLinksCard } from "../social-links-card";

const websiteSettingsPage = {
  container: cn("flex flex-col gap-[18px]"),
  intro: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  columns: cn("grid items-start gap-[18px] lg:grid-cols-2"),
  icon: cn("size-4"),
};

interface WebsiteSettingsPageContentProps {
  settings: SiteSettingsDto;
}

/**
 * Each card keeps its own draft and is keyed by the slice it edits: after a save the page
 * refreshes and only the card whose data changed is rebuilt, so the other drafts survive.
 */
export function WebsiteSettingsPageContent({ settings }: WebsiteSettingsPageContentProps) {
  const { version } = settings;
  return (
    <div className={websiteSettingsPage.container}>
      <div className={websiteSettingsPage.intro}>
        <span className={websiteSettingsPage.description}>
          Gestiona cómo se ve y se comporta el sitio público de la iglesia.
        </span>
        <BoardButton href={settings.url} rel="noreferrer" target="_blank">
          <Globe aria-hidden="true" className={websiteSettingsPage.icon} />
          Ver sitio
        </BoardButton>
      </div>
      <SiteStatusCard
        initialStatus={settings.status}
        key={`status:${settings.status}`}
        version={version}
      />
      <div className={websiteSettingsPage.columns}>
        <GeneralInfoCard
          key={`general:${JSON.stringify([settings.name, settings.shortName, settings.subtitle, settings.url, settings.contactEmail, settings.founded, settings.themeColor])}`}
          settings={settings}
        />
        <AddressCard
          key={`address:${JSON.stringify([settings.addressStreet, settings.addressCity, settings.addressRegion, settings.addressCountry, settings.addressPostal, settings.geoLat, settings.geoLng])}`}
          settings={settings}
        />
      </div>
      <SocialLinksCard
        key={`social:${JSON.stringify([settings.facebook, settings.instagram, settings.youtube, settings.spotify, settings.twitter, settings.linkedin])}`}
        settings={settings}
      />
      <SectionsCard key={`sections:${JSON.stringify(settings.sections)}`} settings={settings} />
      <SeoCard key={`seo:${JSON.stringify(settings.translations)}`} settings={settings} />
    </div>
  );
}
