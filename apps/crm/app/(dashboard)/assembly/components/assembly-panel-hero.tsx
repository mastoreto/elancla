import { Copy, Projector, Send } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { AssemblyReport } from "../types";
import { type AssemblyPanelMode, buildAccessLink } from "../utils/assembly-view";
import { AccessQr } from "./access-qr";

const HERO_CAPTION = {
  open: "Acceso abierto · los asistentes pueden entrar con el código",
  closed: "Acceso cerrado · quien entre verá «aún no disponible»",
  ended: "Acceso finalizado · el código ya no abre el informe",
} as const satisfies Record<AssemblyPanelMode, string>;

const assemblyPanelHeroAssemblyPage = {
  card: cn("flex flex-wrap items-center gap-7 rounded-[34px] bg-(--vino) p-[30px]"),
  text: cn("flex min-w-[280px] flex-1 flex-col gap-3.5"),
  top: cn("flex flex-wrap items-center gap-2.5"),
  pill: cn(
    "inline-flex items-center gap-1.5 rounded-full bg-white/12 px-[11px] py-1 text-xs font-bold whitespace-nowrap text-white",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
  ),
  dot: cn("size-1.5 rounded-full bg-[var(--oro)]"),
  caption: cn("text-[13px] text-white/65"),
  title: cn("font-display text-[30px] leading-[1.15] font-medium text-white"),
  codeRow: cn("flex flex-wrap items-baseline gap-3.5"),
  code: cn(
    "font-display text-5xl leading-none font-semibold tracking-[0.05em] text-white tabular-nums sm:text-[56px]",
  ),
  link: cn("text-sm text-[var(--oro-100)]"),
  actions: cn("flex flex-wrap gap-2.5"),
  primary: cn("bg-white text-primary shadow-none hover:bg-white/90"),
  secondary: cn(
    "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] hover:bg-white/15",
  ),
  icon: cn("size-4"),
  qr: cn(
    "flex flex-col items-center gap-2 rounded-3xl bg-white p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]",
  ),
  qrCode: cn("w-40"),
};

interface AssemblyPanelHeroProps {
  report: AssemblyReport;
  mode: AssemblyPanelMode;
  statusLabel: string;
  onCopyCode: () => void;
}

export function AssemblyPanelHero({
  report,
  mode,
  statusLabel,
  onCopyCode,
}: AssemblyPanelHeroProps) {
  const link = buildAccessLink(report.accessCode);

  return (
    <section className={assemblyPanelHeroAssemblyPage.card}>
      <div className={assemblyPanelHeroAssemblyPage.text}>
        <div className={assemblyPanelHeroAssemblyPage.top}>
          <span className={assemblyPanelHeroAssemblyPage.pill}>
            <span className={assemblyPanelHeroAssemblyPage.dot} />
            {statusLabel}
          </span>
          <span className={assemblyPanelHeroAssemblyPage.caption}>{HERO_CAPTION[mode]}</span>
        </div>
        <b className={assemblyPanelHeroAssemblyPage.title}>{report.reportName}</b>
        <div className={assemblyPanelHeroAssemblyPage.codeRow}>
          <b className={assemblyPanelHeroAssemblyPage.code}>{report.accessCode}</b>
          <span className={assemblyPanelHeroAssemblyPage.link}>{link}</span>
        </div>
        <div className={assemblyPanelHeroAssemblyPage.actions}>
          <BoardButton
            className={assemblyPanelHeroAssemblyPage.primary}
            href={getChurchRoutePath("assembly", report.id, "projection")}
          >
            <Projector aria-hidden="true" className={assemblyPanelHeroAssemblyPage.icon} />
            Proyectar QR
          </BoardButton>
          <BoardButton
            className={assemblyPanelHeroAssemblyPage.secondary}
            onClick={() => navigator.clipboard?.writeText(`https://${link}`).catch(() => undefined)}
          >
            <Send aria-hidden="true" className={assemblyPanelHeroAssemblyPage.icon} />
            Enviar link
          </BoardButton>
          <BoardButton className={assemblyPanelHeroAssemblyPage.secondary} onClick={onCopyCode}>
            <Copy aria-hidden="true" className={assemblyPanelHeroAssemblyPage.icon} />
            Copiar código
          </BoardButton>
        </div>
      </div>
      <div className={assemblyPanelHeroAssemblyPage.qr}>
        <AccessQr className={assemblyPanelHeroAssemblyPage.qrCode} code={report.accessCode} />
      </div>
    </section>
  );
}
