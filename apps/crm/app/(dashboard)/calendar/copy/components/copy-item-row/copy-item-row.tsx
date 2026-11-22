"use client";

import { StatusPill } from "@/components/dashboard/board/status-pill";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CopyItemKind } from "../../types";

const copyItemRowCopyPage = {
  container: cn(
    "flex cursor-pointer items-center gap-3 rounded-[20px] px-3 py-2.5 transition-colors",
    "hover:bg-[var(--oro-50)]",
  ),
  text: cn("flex min-w-0 flex-1 flex-col"),
  title: cn("truncate text-[15px] font-bold"),
  detail: cn("truncate text-[13px] text-[var(--tinta-apagada)]"),
};

const KIND_LABELS = { activity: "Actividad", event: "Evento" } satisfies Record<
  CopyItemKind,
  string
>;

interface CopyItemRowProps {
  kind: CopyItemKind;
  title: string;
  detail: string;
  checked: boolean;
  onCheckedChange: () => void;
  testId: string;
}

/** One copiable item: a checkbox, its title, when it happens and whether it is an activity or an event. */
export function CopyItemRow({
  kind,
  title,
  detail,
  checked,
  onCheckedChange,
  testId,
}: CopyItemRowProps) {
  return (
    <label
      className={copyItemRowCopyPage.container}
      data-testid={testId}
      htmlFor={`${testId}-checkbox`}
    >
      <Checkbox checked={checked} id={`${testId}-checkbox`} onCheckedChange={onCheckedChange} />
      <span className={copyItemRowCopyPage.text}>
        <span className={copyItemRowCopyPage.title}>{title}</span>
        <span className={copyItemRowCopyPage.detail}>{detail}</span>
      </span>
      <StatusPill tone={kind === "activity" ? "gold" : "ink"}>{KIND_LABELS[kind]}</StatusPill>
    </label>
  );
}
