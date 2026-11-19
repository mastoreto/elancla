import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const authButtonPage = {
  base: cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 font-bold whitespace-nowrap",
    "transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  ),
  variant: {
    primary: cn(
      "h-[52px] bg-(image:--grad-granada) text-base text-white",
      "shadow-[0_10px_20px_-12px_rgba(194,58,78,0.9),inset_0_1px_0_rgba(255,255,255,0.25)]",
    ),
    outline: cn(
      "h-12 bg-card text-sm text-foreground shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
    ),
  },
} satisfies Record<string, unknown>;

interface AuthButtonProps extends Omit<ComponentProps<"button">, "className"> {
  variant?: keyof typeof authButtonPage.variant;
}

export function AuthButton({ variant = "primary", type = "button", ...props }: AuthButtonProps) {
  // biome-ignore lint/a11y/useButtonType: `type` defaults to "button" above and callers override it.
  return (
    <button
      className={cn(authButtonPage.base, authButtonPage.variant[variant])}
      type={type}
      {...props}
    />
  );
}
