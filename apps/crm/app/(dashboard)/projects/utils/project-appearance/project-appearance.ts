import { BookOpen, Folder, Globe, Heart, type LucideIcon, Users, Video } from "lucide-react";
import type { IconBubbleTone } from "@/components/dashboard/board/icon-bubble";

interface ProjectAppearance {
  icon: LucideIcon;
  tone: IconBubbleTone;
}

const BY_MINISTRY: Record<string, ProjectAppearance> = {
  General: { icon: Folder, tone: "rose" },
  Jóvenes: { icon: Users, tone: "gold" },
  Misiones: { icon: Globe, tone: "green" },
  "Alcance comunitario": { icon: Heart, tone: "gold" },
  Adoración: { icon: Video, tone: "ink" },
  Niños: { icon: BookOpen, tone: "rose" },
};

const FALLBACK: ProjectAppearance = { icon: Folder, tone: "rose" };

/** Icon and tone of a project, chosen by its first ministry. */
export function getProjectAppearance(ministries: string[]): ProjectAppearance {
  return BY_MINISTRY[ministries[0] ?? ""] ?? FALLBACK;
}
