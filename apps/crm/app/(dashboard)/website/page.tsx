import { db } from "@ancla/db";
import {
  type SiteStatusValue,
  type SocialLinks,
  WebsiteSettingsPageContent,
} from "./components/website-settings-page-content";

const ENUM_TO_STATUS: Record<string, SiteStatusValue> = {
  ONLINE: "online",
  MAINTENANCE: "maintenance",
  CLOSED: "closed",
};

async function loadSettings() {
  try {
    return await db.siteSettings.findFirst({ include: { translations: true } });
  } catch {
    return null;
  }
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function WebsitePage() {
  const settings = await loadSettings();

  const initialStatus: SiteStatusValue = settings
    ? (ENUM_TO_STATUS[settings.status] ?? "online")
    : "online";

  const initialSocial: SocialLinks = {
    website: settings?.website ?? "",
    instagram: settings?.instagram ?? "",
    youtube: settings?.youtube ?? "",
    facebook: settings?.facebook ?? "",
    twitter: settings?.twitter ?? "",
    spotify: settings?.spotify ?? "",
    linkedin: settings?.linkedin ?? "",
  };

  const aboutEs = settings?.translations.find((t) => t.locale === "es")?.aboutRichText;
  const initialAbout = typeof aboutEs === "string" ? aboutEs : "";

  return (
    <WebsiteSettingsPageContent
      initialStatus={initialStatus}
      initialSocial={initialSocial}
      initialAbout={initialAbout}
    />
  );
}
