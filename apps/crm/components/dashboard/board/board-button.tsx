import Link from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: cn(
    "bg-(image:--grad-granada) text-white",
    "shadow-[0_10px_20px_-12px_rgba(194,58,78,0.9),inset_0_1px_0_rgba(255,255,255,0.25)]",
  ),
  outline: cn("bg-card text-foreground shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]"),
  dark: cn("bg-foreground text-white"),
  soft: cn("bg-[var(--granada-50)] text-primary"),
  ghost: cn("bg-transparent text-foreground"),
} satisfies Record<string, string>;

const SIZES = {
  md: cn("h-11 px-5 text-sm"),
  sm: cn("h-9 px-4 text-[13px]"),
  lg: cn("h-[52px] px-6 text-base"),
} satisfies Record<string, string>;

export type BoardButtonVariant = keyof typeof VARIANTS;
export type BoardButtonSize = keyof typeof SIZES;

const boardButtonDashboardPage = {
  base: cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap",
    "transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  ),
};

interface BoardButtonOwnProps {
  variant?: BoardButtonVariant;
  size?: BoardButtonSize;
}

type BoardButtonProps = BoardButtonOwnProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
    | ({ href?: undefined } & Omit<React.ComponentProps<"button">, "className">)
  ) & { className?: string };

export function BoardButton({
  variant = "outline",
  size = "md",
  className,
  ...props
}: BoardButtonProps) {
  const classes = cn(boardButtonDashboardPage.base, VARIANTS[variant], SIZES[size], className);

  if (props.href !== undefined) {
    return <Link className={classes} {...props} />;
  }

  return <button className={classes} type="button" {...props} />;
}
