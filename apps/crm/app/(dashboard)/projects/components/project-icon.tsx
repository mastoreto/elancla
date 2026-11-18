import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import { getProjectAppearance } from "../utils";

interface ProjectIconProps {
  ministries: string[];
  className?: string;
  iconClassName?: string;
}

export function ProjectIcon({ ministries, className, iconClassName }: ProjectIconProps) {
  const { icon: Icon, tone } = getProjectAppearance(ministries);

  return (
    <IconBubble className={className} tone={tone}>
      <Icon aria-hidden="true" className={cn("size-[18px]", iconClassName)} />
    </IconBubble>
  );
}
