import type * as React from "react";
import { cn } from "@/lib/utils";

const TONES = {
  gold: cn(
    "bg-(image:--grad-avatar) text-[var(--oro-texto)] shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(201,161,74,0.4)]",
  ),
  green: cn(
    "bg-[linear-gradient(150deg,#dcf3e5,#b3dfc4)] text-[var(--vida)] shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(47,125,87,0.3)]",
  ),
  rose: cn(
    "bg-[linear-gradient(150deg,#ffe3e7,#f6b9c3)] text-primary shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(194,58,78,0.35)]",
  ),
  ink: cn(
    "bg-[linear-gradient(150deg,#f4eef0,#e2d6da)] text-foreground shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(42,21,26,0.2)]",
  ),
} satisfies Record<string, string>;

export type IconBubbleTone = keyof typeof TONES;

const iconBubbleDashboardPage = {
  base: cn("inline-flex shrink-0 items-center justify-center rounded-full"),
};

interface IconBubbleProps extends React.ComponentProps<"span"> {
  tone?: IconBubbleTone;
}

export function IconBubble({ tone = "gold", className, ...props }: IconBubbleProps) {
  return <span className={cn(iconBubbleDashboardPage.base, TONES[tone], className)} {...props} />;
}
