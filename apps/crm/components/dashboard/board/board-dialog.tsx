"use client";

import { X } from "lucide-react";
import type * as React from "react";
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const boardDialogDashboardPage = {
  content: cn(
    "gap-[18px] rounded-[34px] border-0 bg-card p-[30px] sm:max-w-[520px]",
    "shadow-[0_30px_60px_-30px_rgba(60,20,30,0.45)]",
  ),
  close: cn(
    "absolute top-5 right-5 inline-flex size-9 items-center justify-center rounded-full bg-secondary text-foreground",
  ),
  header: cn("flex flex-col gap-2 pr-9"),
  title: cn("font-display text-[25px] leading-[1.15] font-medium tracking-tight"),
  description: cn("text-[14.5px] leading-[1.55] text-[var(--tinta-suave)]"),
};

interface BoardDialogContentProps
  extends Omit<React.ComponentProps<typeof DialogContent>, "title" | "showCloseButton"> {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function BoardDialogContent({
  title,
  description,
  className,
  children,
  ...props
}: BoardDialogContentProps) {
  return (
    <DialogContent
      className={cn(boardDialogDashboardPage.content, className)}
      showCloseButton={false}
      {...props}
    >
      <DialogClose aria-label="Cerrar" className={boardDialogDashboardPage.close}>
        <X aria-hidden="true" className="size-4" />
      </DialogClose>
      <div className={boardDialogDashboardPage.header}>
        <DialogTitle className={boardDialogDashboardPage.title}>{title}</DialogTitle>
        <DialogDescription className={boardDialogDashboardPage.description}>
          {description}
        </DialogDescription>
      </div>
      {children}
    </DialogContent>
  );
}
