"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: cn(
    "h-[52px] w-full bg-(image:--grad-granada) px-6 text-base text-white",
    "shadow-[0_10px_20px_-12px_rgba(194,58,78,0.9),inset_0_1px_0_rgba(255,255,255,0.25)]",
  ),
  outline: cn("h-11 bg-card px-5 text-sm shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]"),
  ghost: cn("h-11 bg-transparent px-5 text-sm"),
} satisfies Record<string, string>;

export type PublicButtonVariant = keyof typeof VARIANTS;

const publicButtonInformePage = {
  base: cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap text-foreground transition hover:-translate-y-px",
  ),
};

interface PublicButtonProps extends React.ComponentProps<"button"> {
  variant?: PublicButtonVariant;
}

export function PublicButton({ variant = "outline", className, ...props }: PublicButtonProps) {
  return (
    <button
      className={cn(publicButtonInformePage.base, VARIANTS[variant], className)}
      type="button"
      {...props}
    />
  );
}
