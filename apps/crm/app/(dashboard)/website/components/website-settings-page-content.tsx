import { DashboardPageHeader } from "@/components/dashboard";
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

export function WebsiteSettingsPageContent({
  initialStatus,
  initialSocial,
  initialAbout,
}: WebsiteSettingsProps) {
  return (
    <div>
      <DashboardPageHeader
        description="Gestiona cómo se ve y se comporta el sitio público de la iglesia."
        emphasis="público"
        kicker="Contenido"
        title="Sitio web"
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <SiteStatusSection initialStatus={initialStatus} />
        <SocialLinksSection initialLinks={initialSocial} />
        <AboutSection initialContent={initialAbout} />
      </div>
    </div>
  );
}
