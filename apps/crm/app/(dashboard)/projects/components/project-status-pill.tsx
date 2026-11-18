import { StatusPill } from "@/components/dashboard/board/status-pill";
import type { ProjectStatus } from "@/lib/types";
import { PROJECT_STATUS_PILL } from "../utils";

interface ProjectStatusPillProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusPill({ status, className }: ProjectStatusPillProps) {
  const { tone, label } = PROJECT_STATUS_PILL[status];

  return (
    <StatusPill className={className} tone={tone}>
      {label}
    </StatusPill>
  );
}
