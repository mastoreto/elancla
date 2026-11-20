"use client";

import type { SiteSettingsDto } from "@ancla/contracts";
import { Link2, Mic, Video } from "lucide-react";
import { useState } from "react";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";
import { toNullableText } from "../../utils/toNullableText";
import { CardSaveFooter } from "../card-save-footer";

const socialLinksCardWebsitePage = {
  grid: cn("grid gap-3.5 md:grid-cols-2"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
};

const PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/miiglesia",
    icon: Link2,
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/miiglesia",
    icon: Link2,
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@miiglesia",
    icon: Video,
  },
  {
    key: "spotify",
    label: "Spotify",
    placeholder: "https://open.spotify.com/show/…",
    icon: Mic,
  },
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/miiglesia", icon: Link2 },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/miiglesia",
    icon: Link2,
  },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];
type SocialLinks = Record<PlatformKey, string>;
type SocialSettings = Pick<SiteSettingsDto, PlatformKey | "version">;

interface SocialLinksCardProps {
  settings: SocialSettings;
}

export function SocialLinksCard({ settings }: SocialLinksCardProps) {
  const [links, setLinks] = useState<SocialLinks>(
    () => Object.fromEntries(PLATFORMS.map(({ key }) => [key, settings[key] ?? ""])) as SocialLinks,
  );
  const { canEdit, saving, save } = useSaveSiteSettings(settings.version);

  const submit = () =>
    save(
      Object.fromEntries(PLATFORMS.map(({ key }) => [key, toNullableText(links[key])])),
      "Redes sociales actualizadas",
    );

  return (
    <BoardCard>
      <BoardCardHeader subtitle="Enlaces que aparecen en el pie del sitio" title="Redes sociales" />
      <div className={socialLinksCardWebsitePage.grid}>
        {PLATFORMS.map(({ key, label, placeholder, icon: Icon }) => (
          <BoardInput
            disabled={!canEdit}
            icon={<Icon aria-hidden="true" className={socialLinksCardWebsitePage.icon} />}
            id={`social-${key}`}
            key={key}
            label={label}
            onChange={(event) =>
              setLinks((previous) => ({ ...previous, [key]: event.target.value }))
            }
            placeholder={placeholder}
            type="url"
            value={links[key]}
          />
        ))}
      </div>
      <CardSaveFooter canEdit={canEdit} onSave={() => void submit()} saving={saving} />
    </BoardCard>
  );
}
