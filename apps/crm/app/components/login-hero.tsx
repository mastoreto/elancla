import { ArrowUpRight, Check, Heart, MoreHorizontal } from "lucide-react";
import { BrandMark } from "@/components/dashboard";
import { cn } from "@/lib/utils";

const loginHeroPage = {
  container: cn(
    "relative hidden flex-[1.05] flex-col justify-between overflow-hidden rounded-[34px] bg-(image:--grad-marco) px-[50px] py-11 text-white lg:flex",
  ),
  brand: cn("inline-flex items-center gap-2.5"),
  brandName: cn("font-display text-[21px] font-semibold tracking-tight text-white"),
  copy: cn("flex max-w-[520px] flex-col gap-[22px]"),
  title: cn("font-display text-[68px] leading-none font-semibold tracking-[-0.03em]"),
  lead: cn("text-[17px] leading-relaxed text-white/70"),
  cards: cn("flex gap-3.5 text-foreground"),
  card: cn(
    "flex min-w-0 flex-col rounded-xl bg-white/[0.74] p-[18px] backdrop-blur-[12px]",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.95),0_10px_30px_-18px_rgba(60,20,30,0.28)]",
  ),
  offeringCard: cn("gap-[18px]"),
  approvedCard: cn("min-w-[200px] gap-3"),
  cardTop: cn("flex items-start justify-between"),
  iconGold: cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-(image:--grad-avatar) text-[var(--oro-texto)]",
    "shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(201,161,74,0.4)]",
  ),
  iconGreen: cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(150deg,#dcf3e5,#b3dfc4)] text-[var(--vida)]",
    "shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(47,125,87,0.3)]",
  ),
  muted: cn("text-[var(--tinta-apagada)]"),
  metric: cn("flex flex-col gap-1"),
  metricValue: cn(
    "font-display text-[28px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums",
  ),
  metricLabel: cn("text-[13px] text-[var(--tinta-suave)]"),
  trend: cn("inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--vida)]"),
  trendIcon: cn(
    "inline-flex size-[18px] items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_var(--vida)]",
  ),
  approvedValue: cn("font-display text-[22px] font-semibold"),
};

export function LoginHero() {
  return (
    <section className={loginHeroPage.container}>
      <div className={loginHeroPage.brand}>
        <BrandMark />
        <b className={loginHeroPage.brandName}>iEkklesia</b>
      </div>

      <div className={loginHeroPage.copy}>
        <h2 className={loginHeroPage.title}>
          Cuentas en paz,
          <br />
          comunidad en orden.
        </h2>
        <p className={loginHeroPage.lead}>
          Tesorería, solicitudes, votaciones y contenido de tu iglesia, en un solo lugar y con
          calma.
        </p>
      </div>

      <div className={loginHeroPage.cards}>
        <div className={cn(loginHeroPage.card, loginHeroPage.offeringCard)}>
          <div className={loginHeroPage.cardTop}>
            <span className={loginHeroPage.iconGold}>
              <Heart aria-hidden="true" className="size-[18px]" />
            </span>
            <MoreHorizontal aria-hidden="true" className={cn(loginHeroPage.muted, "size-[18px]")} />
          </div>
          <div className={loginHeroPage.metric}>
            <b className={loginHeroPage.metricValue}>$ 24.300</b>
            <span className={loginHeroPage.metricLabel}>Ofrendas del mes</span>
          </div>
          <span className={loginHeroPage.trend}>
            <span className={loginHeroPage.trendIcon}>
              <ArrowUpRight aria-hidden="true" className="size-2.5" />
            </span>
            12.1%
          </span>
        </div>
        <div className={cn(loginHeroPage.card, loginHeroPage.approvedCard)}>
          <span className={loginHeroPage.iconGreen}>
            <Check aria-hidden="true" className="size-[18px]" />
          </span>
          <b className={loginHeroPage.approvedValue}>12 aprobadas</b>
          <span className={loginHeroPage.metricLabel}>Solicitudes resueltas esta semana</span>
        </div>
      </div>
    </section>
  );
}
