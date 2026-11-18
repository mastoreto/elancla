"use client";

import { Globe, Music2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { toast } from "sonner";
import { SettingsSectionShell } from "@/app/(dashboard)/settings/components/settings-section-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { updateSocialLinks } from "../actions";

const platforms = [
  {
    key: "website",
    label: "Sitio web",
    placeholder: "https://miiglesia.com",
    icon: Globe,
    color: "text-sky-500",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/miiglesia",
    icon: FaInstagram,
    color: "text-pink-500",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@miiglesia",
    icon: FaYoutube,
    color: "text-red-500",
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/miiglesia",
    icon: FaFacebook,
    color: "text-blue-600",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    placeholder: "https://x.com/miiglesia",
    icon: FaXTwitter,
    color: "text-foreground",
  },
  {
    key: "spotify",
    label: "Spotify",
    placeholder: "https://open.spotify.com/show/…",
    icon: Music2,
    color: "text-emerald-500",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/miiglesia",
    icon: FaLinkedin,
    color: "text-blue-700",
  },
] as const;

type SocialLinks = Record<(typeof platforms)[number]["key"], string>;

export function SocialLinksSection({ initialLinks }: { initialLinks: SocialLinks }) {
  const [links, setLinks] = useState<SocialLinks>(initialLinks);
  const [isPending, startTransition] = useTransition();

  const handleChange = (key: keyof SocialLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSocialLinks(links);
        toast.success("Redes sociales actualizadas");
      } catch {
        toast.error("Revisá las URLs: no se pudieron guardar las redes sociales");
      }
    });
  };

  return (
    <SettingsSectionShell
      title="Redes sociales"
      description="Links que aparecerán en el pie de página y en la sección de contacto del sitio web."
      action={
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="size-3.5" />
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      }
      contentClassName="space-y-3"
    >
      {platforms.map(({ key, label, placeholder, icon: Icon, color }) => (
        <div key={key} className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40",
              color,
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <Input
              value={links[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              type="url"
              className="h-8 text-sm"
            />
          </div>
        </div>
      ))}
    </SettingsSectionShell>
  );
}
