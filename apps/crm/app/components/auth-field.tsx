import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const authFieldPage = {
  field: cn("flex w-full flex-col gap-[7px]"),
  label: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  control: cn(
    "flex min-h-12 items-center gap-2.5 rounded-lg bg-card px-4 text-sm",
    "shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)] transition-shadow",
    "focus-within:shadow-[inset_0_0_0_1.5px_var(--granada),0_0_0_4px_var(--granada-100)]",
  ),
  icon: cn("size-[17px] shrink-0 text-[var(--tinta-apagada)]"),
  input: cn(
    "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-[var(--tinta-apagada)]",
  ),
};

interface AuthFieldProps extends Omit<ComponentProps<"input">, "className"> {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Control rendered after the input, e.g. the show-password toggle. */
  trailing?: ReactNode;
}

/** Labelled input in the login style. The icon should use `authFieldIconClassName`. */
export function AuthField({ id, label, icon, trailing, ...inputProps }: AuthFieldProps) {
  return (
    <label className={authFieldPage.field} htmlFor={id}>
      <span className={authFieldPage.label}>{label}</span>
      <span className={authFieldPage.control}>
        {icon}
        <input className={authFieldPage.input} id={id} {...inputProps} />
        {trailing}
      </span>
    </label>
  );
}

export const authFieldIconClassName = authFieldPage.icon;
