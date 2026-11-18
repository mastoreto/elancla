"use client";

import { Church, CirclePause, CirclePlay, Lock, Minimize2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { PLACE_SAMPLE } from "../data/assembly-panel-samples";
import type { AssemblyReport, AssemblyReportStatus } from "../types";
import { buildAccessLink, getPanelMode } from "../utils/assembly-view";
import { AccessQr } from "./access-qr";
import { AssemblyTakedownDialog } from "./assembly-takedown-dialog";

const assemblyProjectionAssemblyPage = {
  stage: cn(
    "relative flex min-h-[640px] items-center overflow-hidden rounded-[30px] px-8 pt-24 pb-32 text-white sm:px-14 lg:min-h-[774px]",
    "bg-[radial-gradient(70%_90%_at_0%_100%,rgba(194,58,78,0.55),transparent_62%),radial-gradient(60%_70%_at_100%_0%,rgba(201,161,74,0.3),transparent_65%),linear-gradient(180deg,#1c1013,#25141a)]",
    "shadow-[0_30px_60px_-30px_rgba(60,20,30,0.6)]",
  ),
  statusWrap: cn("absolute top-8 right-8 sm:right-14"),
  status: cn(
    "inline-flex items-center gap-3 rounded-full px-6 py-3 text-xl font-bold text-white",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]",
  ),
  statusClosed: cn("bg-white/12"),
  statusOpen: cn("bg-[rgba(39,109,76,0.9)]"),
  statusDot: cn("size-3 rounded-full"),
  dotClosed: cn("bg-[var(--oro-100)]"),
  dotOpen: cn("bg-[#8fe0b4]"),
  layout: cn(
    "flex w-full flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-12 2xl:gap-20",
  ),
  info: cn("flex min-w-0 flex-1 flex-col gap-5"),
  brand: cn("flex items-center gap-3.5"),
  brandMark: cn(
    "inline-flex size-14 items-center justify-center rounded-[18px] bg-(image:--grad-granada)",
    "shadow-[0_8px_18px_-8px_rgba(194,58,78,0.9)]",
  ),
  brandIcon: cn("size-7"),
  brandName: cn("font-display text-[30px] font-medium"),
  assembly: cn(
    "mt-3.5 text-[15px] font-extrabold tracking-[0.16em] text-[var(--oro-100)] uppercase",
  ),
  title: cn(
    "font-display text-4xl leading-[1.05] font-semibold tracking-tight lg:text-5xl 2xl:text-[64px]",
  ),
  hint: cn("max-w-[520px] text-lg leading-normal text-white/75 2xl:text-[22px]"),
  codeBox: cn(
    "mt-2.5 flex w-fit flex-col gap-2 rounded-[28px] bg-white/8 px-[26px] py-[22px]",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]",
  ),
  codeCaption: cn("text-[15px] text-white/65"),
  codeLink: cn("font-display text-[30px] font-medium"),
  code: cn(
    "font-display text-4xl leading-[1.1] font-semibold tracking-[0.08em] text-[var(--oro-100)] tabular-nums 2xl:text-[58px]",
  ),
  qrWrap: cn(
    "relative shrink-0 rounded-[44px] bg-white p-[26px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]",
  ),
  qr: cn("w-56 lg:w-64 2xl:w-80"),
  veil: cn("absolute inset-0 flex items-center justify-center rounded-[44px] bg-white/55"),
  veilPill: cn(
    "inline-flex items-center gap-3 rounded-full bg-foreground px-[26px] py-4 text-xl font-bold text-white",
  ),
  footer: cn(
    "absolute right-8 bottom-6 hidden items-center gap-2 text-[13px] text-white/50 sm:right-[72px] 2xl:flex",
  ),
  footerMark: cn(
    "inline-flex size-5 items-center justify-center rounded-md bg-(image:--grad-granada)",
  ),
  footerBrand: cn("text-white/80"),
  presenter: cn(
    "absolute bottom-[22px] left-1/2 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2.5 rounded-3xl px-3 py-2.5 sm:rounded-full",
    "bg-[rgba(28,16,19,0.78)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-md",
  ),
  presenterLabel: cn("px-2.5 text-[12.5px] text-white/60"),
  control: cn(
    "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white/10 px-4 text-[13px] font-bold whitespace-nowrap text-white",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] transition hover:bg-white/15",
  ),
  controlPrimary: cn("bg-(image:--grad-granada) shadow-none"),
  icon: cn("size-4"),
};

/** Presenter view: full-screen QR for the room. Status changes are local until the API exists. */
export function AssemblyProjection({ report }: { report: AssemblyReport }) {
  const router = useRouter();
  const [status, setStatus] = useState<AssemblyReportStatus>(report.status);
  const open = getPanelMode(status) === "open";
  const panelPath = getChurchRoutePath("assembly", report.id);

  return (
    <section className={assemblyProjectionAssemblyPage.stage}>
      <div className={assemblyProjectionAssemblyPage.statusWrap}>
        <span
          className={cn(
            assemblyProjectionAssemblyPage.status,
            open
              ? assemblyProjectionAssemblyPage.statusOpen
              : assemblyProjectionAssemblyPage.statusClosed,
          )}
        >
          <span
            className={cn(
              assemblyProjectionAssemblyPage.statusDot,
              open
                ? assemblyProjectionAssemblyPage.dotOpen
                : assemblyProjectionAssemblyPage.dotClosed,
            )}
          />
          {open
            ? `Acceso abierto · ${PLACE_SAMPLE.connected} personas conectadas`
            : "Acceso cerrado · se habilitará al iniciar"}
        </span>
      </div>

      <div className={assemblyProjectionAssemblyPage.layout}>
        <div className={assemblyProjectionAssemblyPage.info}>
          <div className={assemblyProjectionAssemblyPage.brand}>
            <span className={assemblyProjectionAssemblyPage.brandMark}>
              <Church aria-hidden="true" className={assemblyProjectionAssemblyPage.brandIcon} />
            </span>
            <b className={assemblyProjectionAssemblyPage.brandName}>Iglesia El Ancla</b>
          </div>
          <span className={assemblyProjectionAssemblyPage.assembly}>{report.assembly}</span>
          <h1 className={assemblyProjectionAssemblyPage.title}>{report.title}</h1>
          <p className={assemblyProjectionAssemblyPage.hint}>
            Escanea el código con la cámara de tu celular o entra con el link. Debes estar en el
            templo para ver el informe.
          </p>
          <div className={assemblyProjectionAssemblyPage.codeBox}>
            <span className={assemblyProjectionAssemblyPage.codeCaption}>
              O ingresa el código en
            </span>
            <b className={assemblyProjectionAssemblyPage.codeLink}>
              {buildAccessLink(report.accessCode)}
            </b>
            <b className={assemblyProjectionAssemblyPage.code}>{report.accessCode}</b>
          </div>
        </div>
        <div className={assemblyProjectionAssemblyPage.qrWrap}>
          <AccessQr className={assemblyProjectionAssemblyPage.qr} code={report.accessCode} />
          {open ? null : (
            <div className={assemblyProjectionAssemblyPage.veil}>
              <span className={assemblyProjectionAssemblyPage.veilPill}>
                <Lock aria-hidden="true" className={assemblyProjectionAssemblyPage.icon} />
                Aún cerrado
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={assemblyProjectionAssemblyPage.footer}>
        Generado con la tecnología de
        <span className={assemblyProjectionAssemblyPage.footerMark} />
        <b className={assemblyProjectionAssemblyPage.footerBrand}>iEkklesia</b>
      </div>

      <div className={assemblyProjectionAssemblyPage.presenter}>
        <span className={assemblyProjectionAssemblyPage.presenterLabel}>Vista del presentador</span>
        {open ? (
          <>
            <button
              className={assemblyProjectionAssemblyPage.control}
              onClick={() => setStatus("Sin habilitar")}
              type="button"
            >
              <CirclePause aria-hidden="true" className={assemblyProjectionAssemblyPage.icon} />
              Deshabilitar
            </button>
            <AssemblyTakedownDialog
              code={report.accessCode}
              connected={PLACE_SAMPLE.connected}
              onConfirm={() => router.push(getChurchRoutePath("assembly"))}
              trigger={
                <button className={assemblyProjectionAssemblyPage.control} type="button">
                  <Trash2 aria-hidden="true" className={assemblyProjectionAssemblyPage.icon} />
                  Dar de baja
                </button>
              }
            />
          </>
        ) : (
          <button
            className={cn(
              assemblyProjectionAssemblyPage.control,
              assemblyProjectionAssemblyPage.controlPrimary,
            )}
            onClick={() => setStatus("Abierto")}
            type="button"
          >
            <CirclePlay aria-hidden="true" className={assemblyProjectionAssemblyPage.icon} />
            Habilitar acceso
          </button>
        )}
        <button
          className={assemblyProjectionAssemblyPage.control}
          onClick={() => router.push(panelPath)}
          type="button"
        >
          <Minimize2 aria-hidden="true" className={assemblyProjectionAssemblyPage.icon} />
          Salir de pantalla completa
        </button>
      </div>
    </section>
  );
}
