import type * as React from "react";
import { cn } from "@/lib/utils";

const TONES = {
  gold: cn(
    "bg-(image:--grad-avatar) text-[var(--oro-texto)] shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(201,161,74,0.4)]",
  ),
  rose: cn(
    "bg-[linear-gradient(150deg,#ffe3e7,#f6b9c3)] text-primary shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(194,58,78,0.35)]",
  ),
  ink: cn(
    "bg-[linear-gradient(150deg,#f4eef0,#e2d6da)] text-foreground shadow-[0_0_0_4px_rgba(255,255,255,0.7),0_8px_18px_-6px_rgba(42,21,26,0.2)]",
  ),
} satisfies Record<string, string>;

export type PublicStateTone = keyof typeof TONES;

const publicStateScreenInformePage = {
  container: cn(
    "flex flex-1 flex-col items-center justify-center gap-[18px] px-7 py-10 text-center",
  ),
  icon: cn("inline-flex size-[92px] shrink-0 items-center justify-center rounded-full"),
  title: cn(
    "max-w-[420px] font-display text-3xl leading-[1.15] font-semibold tracking-tight text-balance",
  ),
  body: cn("max-w-[290px] text-[15px] leading-relaxed text-[var(--tinta-suave)] md:max-w-[360px]"),
  actions: cn("flex w-full max-w-[360px] flex-col items-center gap-2.5"),
};

interface PublicStateScreenProps {
  tone: PublicStateTone;
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}

export function PublicStateScreen({ tone, icon, title, body, children }: PublicStateScreenProps) {
  return (
    <div className={publicStateScreenInformePage.container}>
      <span className={cn(publicStateScreenInformePage.icon, TONES[tone])}>{icon}</span>
      <h1 className={publicStateScreenInformePage.title}>{title}</h1>
      <p className={publicStateScreenInformePage.body}>{body}</p>
      {children ? <div className={publicStateScreenInformePage.actions}>{children}</div> : null}
    </div>
  );
}
