import type * as React from "react";
import { BrandMark } from "@/components/dashboard";
import { churchConfig } from "@/lib/church";
import { cn } from "@/lib/utils";

const publicShellInformePage = {
  container: cn("mx-auto flex min-h-dvh w-full max-w-[760px] flex-col bg-background"),
  containerWithGlow: cn(
    "bg-[radial-gradient(70%_40%_at_50%_30%,rgba(201,161,74,0.2),transparent_70%)]",
  ),
  header: cn("flex items-center gap-2.5 px-6 pt-[22px] md:px-9 md:pt-[26px]"),
  brandMark: cn("size-[34px] rounded-[11px] md:size-[38px] md:rounded-md"),
  brandText: cn("flex flex-col leading-tight"),
  brandName: cn("font-display text-lg font-semibold md:text-xl"),
  brandSubtitle: cn("text-[11.5px] text-[var(--tinta-apagada)] md:hidden"),
  spacer: cn("flex-1"),
  body: cn("flex flex-1 flex-col"),
  footer: cn(
    "flex items-center justify-center gap-2 px-6 pt-[18px] pb-6 text-xs text-[var(--tinta-apagada)]",
  ),
  footerMark: cn("size-[18px] rounded-[6px]"),
  footerIcon: cn("size-3"),
  footerName: cn("text-[var(--tinta-suave)]"),
};

interface PublicShellProps {
  children: React.ReactNode;
  /** Pill shown at the right of the header, e.g. the report validity. */
  headerSlot?: React.ReactNode;
  withGlow?: boolean;
}

export function PublicShell({ children, headerSlot, withGlow = false }: PublicShellProps) {
  return (
    <div
      className={cn(
        publicShellInformePage.container,
        withGlow && publicShellInformePage.containerWithGlow,
      )}
    >
      <header className={publicShellInformePage.header}>
        <BrandMark
          className={publicShellInformePage.brandMark}
          iconClassName={publicShellInformePage.footerIcon}
        />
        <div className={publicShellInformePage.brandText}>
          <b className={publicShellInformePage.brandName}>Iglesia {churchConfig.name}</b>
          <span className={publicShellInformePage.brandSubtitle}>Informe de asamblea</span>
        </div>
        <span className={publicShellInformePage.spacer} />
        {headerSlot}
      </header>
      <main className={publicShellInformePage.body}>{children}</main>
      <footer className={publicShellInformePage.footer}>
        Generado con la tecnología de
        <BrandMark
          className={publicShellInformePage.footerMark}
          iconClassName={publicShellInformePage.footerIcon}
        />
        <b className={publicShellInformePage.footerName}>iEkklesia</b>
      </footer>
    </div>
  );
}
