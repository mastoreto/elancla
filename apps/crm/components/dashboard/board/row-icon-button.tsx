import Link from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";

const rowIconButtonDashboardPage = {
  base: cn(
    "inline-flex size-[34px] shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition",
    "hover:bg-(--granada-50) hover:text-primary",
  ),
};

/** Same look for triggers that must forward Radix props (e.g. dialog triggers). */
export const rowIconButtonClass = rowIconButtonDashboardPage.base;

type RowIconButtonProps = { label: string; className?: string; children: React.ReactNode } & (
  | { href: string; onClick?: undefined }
  | { href?: undefined; onClick: () => void }
);

/** 34 px round action button used at the end of table rows. */
export function RowIconButton({ label, className, children, href, onClick }: RowIconButtonProps) {
  const classes = cn(rowIconButtonDashboardPage.base, className);

  if (href !== undefined) {
    return (
      <Link aria-label={label} className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button aria-label={label} className={classes} onClick={onClick} type="button">
      {children}
    </button>
  );
}
