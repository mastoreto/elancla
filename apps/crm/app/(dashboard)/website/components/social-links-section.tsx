"use client";

import { Link2, Mic, Video } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { updateSocialLinks } from "../actions";

const socialLinksSectionWebsitePage = {
  grid: cn("grid gap-3.5 md:grid-cols-2"),
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  footer: cn("mt-3.5 flex justify-end"),
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
type SocialLinks = Record<PlatformKey | "website", string>;

export function SocialLinksSection({ initialLinks }: { initialLinks: SocialLinks }) {
  const [links, setLinks] = useState<SocialLinks>(initialLinks);
  const [isPending, startTransition] = useTransition();
  const isDirty = PLATFORMS.some(({ key }) => links[key] !== initialLinks[key]);

  const save = () => {
    startTransition(async () => {
      try {
        await updateSocialLinks(links);
        toast.success("Redes sociales actualizadas");
      } catch {
        toast.error("Revisa las URLs: no se pudieron guardar las redes sociales");
      }
    });
  };

  return (
    <BoardCard>
      <BoardCardHeader subtitle="Enlaces que aparecen en el pie del sitio" title="Redes sociales" />
      <div className={socialLinksSectionWebsitePage.grid}>
        {PLATFORMS.map(({ key, label, placeholder, icon: Icon }) => (
          <BoardInput
            icon={<Icon aria-hidden="true" className={socialLinksSectionWebsitePage.icon} />}
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
      {isDirty ? (
        <div className={socialLinksSectionWebsitePage.footer}>
          <BoardButton disabled={isPending} onClick={save} variant="primary">
            {isPending ? "Guardando…" : "Guardar cambios"}
          </BoardButton>
        </div>
      ) : null}
    </BoardCard>
  );
}
