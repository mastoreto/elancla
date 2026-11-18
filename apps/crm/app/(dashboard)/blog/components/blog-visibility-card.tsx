"use client";

import { Eye } from "lucide-react";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const blogVisibilityCardContentPage = {
  card: cn("flex items-center gap-3.5 px-[22px] py-4"),
  bubble: cn("size-10"),
  icon: cn("size-[18px]"),
  text: cn("flex flex-1 flex-col gap-0.5"),
  title: cn("text-[15px] font-bold"),
  hint: cn("text-[13px] text-[var(--tinta-suave)]"),
  control: cn("h-7 w-12 data-[state=checked]:bg-primary [&>span]:size-6"),
};

interface BlogVisibilityCardProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
}

/** Hides the whole public blog without deleting anything. */
export function BlogVisibilityCard({ visible, onVisibleChange }: BlogVisibilityCardProps) {
  return (
    <BoardCard className={blogVisibilityCardContentPage.card}>
      <IconBubble className={blogVisibilityCardContentPage.bubble} tone="green">
        <Eye aria-hidden="true" className={blogVisibilityCardContentPage.icon} />
      </IconBubble>
      <div className={blogVisibilityCardContentPage.text}>
        <b className={blogVisibilityCardContentPage.title}>El blog es visible al público</b>
        <span className={blogVisibilityCardContentPage.hint}>
          Apágalo para ocultarlo sin borrar nada.
        </span>
      </div>
      <Switch
        aria-label="El blog es visible al público"
        checked={visible}
        className={blogVisibilityCardContentPage.control}
        onCheckedChange={onVisibleChange}
      />
    </BoardCard>
  );
}
