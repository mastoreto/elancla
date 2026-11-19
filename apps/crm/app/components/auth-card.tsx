import type { ReactNode } from "react";
import { BrandMark } from "@/components/dashboard";
import { churchConfig } from "@/lib/church";
import { cn } from "@/lib/utils";

const authCardPage = {
  container: cn("flex w-full max-w-[420px] flex-col gap-6"),
  brand: cn("flex flex-col items-center gap-2.5 text-center"),
  brandMark: cn("size-[60px] rounded-[19px]"),
  brandIcon: cn("size-8"),
  brandName: cn("font-display text-3xl font-semibold"),
  brandSubtitle: cn("text-sm text-[var(--tinta-apagada)]"),
  card: cn("rounded-[28px] bg-card p-[30px] shadow-(--sombra)"),
  heading: cn("mb-[18px] flex flex-col gap-1"),
  title: cn("font-display text-[26px] font-medium"),
  subtitle: cn("text-sm text-[var(--tinta-suave)]"),
  footer: cn("text-center text-[12.5px] text-[var(--tinta-apagada)]"),
};

interface AuthCardProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/** Brand header plus the white card every signed-out form lives in. */
export function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <div className={authCardPage.container}>
      <div className={authCardPage.brand}>
        <BrandMark className={authCardPage.brandMark} iconClassName={authCardPage.brandIcon} />
        <b className={authCardPage.brandName}>Iglesia {churchConfig.name}</b>
        <span className={authCardPage.brandSubtitle}>Administración eclesiástica</span>
      </div>

      <div className={authCardPage.card}>
        <div className={authCardPage.heading}>
          <h1 className={authCardPage.title}>{title}</h1>
          {subtitle ? <p className={authCardPage.subtitle}>{subtitle}</p> : null}
        </div>
        {children}
      </div>

      {footer ? <p className={authCardPage.footer}>{footer}</p> : null}
    </div>
  );
}
