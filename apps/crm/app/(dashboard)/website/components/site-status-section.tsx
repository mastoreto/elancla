"use client";

import { Save } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SettingsSectionShell } from "@/app/(dashboard)/settings/components/settings-section-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateSiteStatus } from "../actions";

const siteStatusSectionContentPage = {
  checkedOnline: cn(
    "data-[state=checked]:border-income data-[state=checked]:bg-success-surface dark:data-[state=checked]:bg-success-surface/40",
  ),
  checkedMaintenance: cn(
    "data-[state=checked]:border-oro data-[state=checked]:bg-warning-surface dark:data-[state=checked]:bg-warning-surface/40",
  ),
  checkedOffline: cn(
    "data-[state=checked]:border-granada data-[state=checked]:bg-accent dark:data-[state=checked]:bg-accent/40",
  ),
  option: cn(
    "group relative flex flex-col gap-2 rounded-xl border border-border bg-background p-4 text-left",
  ),
  optionInteractive: cn("cursor-pointer transition-all outline-none"),
  optionHover: cn("hover:border-foreground/25 hover:shadow-sm"),
  radio: cn("size-4 rounded-full border-2 border-border transition-colors"),
  radioInner: cn("flex h-full w-full items-center justify-center"),
  optionHint: cn("text-xs leading-relaxed text-muted-foreground"),
};

type SiteStatus = "online" | "maintenance" | "closed";

const statusOptions: {
  value: SiteStatus;
  label: string;
  description: string;
  color: string;
  dot: string;
  ring: string;
}[] = [
  {
    value: "online",
    label: "En línea",
    description: "El sitio web es visible y accesible para todos.",
    color: "text-income",
    dot: "bg-income",
    ring: siteStatusSectionContentPage.checkedOnline,
  },
  {
    value: "maintenance",
    label: "Mantenimiento",
    description: "Se muestra una página de mantenimiento a los visitantes.",
    color: "text-warning",
    dot: "bg-oro",
    ring: siteStatusSectionContentPage.checkedMaintenance,
  },
  {
    value: "closed",
    label: "Cerrado",
    description: "El sitio está inaccesible. Solo los administradores pueden verlo.",
    color: "text-expense",
    dot: "bg-granada",
    ring: siteStatusSectionContentPage.checkedOffline,
  },
];

export function SiteStatusSection({ initialStatus }: { initialStatus: SiteStatus }) {
  const [status, setStatus] = useState<SiteStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSiteStatus(status);
        toast.success("Estado del sitio actualizado");
      } catch {
        toast.error("No se pudo actualizar el estado del sitio");
      }
    });
  };

  return (
    <SettingsSectionShell
      title="Estado del sitio"
      description="Controla la visibilidad pública del sitio web de la iglesia."
      action={
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="size-3.5" />
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      }
    >
      <RadioGroupPrimitive.Root
        value={status}
        onValueChange={(v) => setStatus(v as SiteStatus)}
        className="grid gap-3 sm:grid-cols-3"
      >
        {statusOptions.map((opt) => (
          <RadioGroupPrimitive.Item
            key={opt.value}
            value={opt.value}
            className={cn(
              siteStatusSectionContentPage.option,
              siteStatusSectionContentPage.optionInteractive,
              siteStatusSectionContentPage.optionHover,
              "focus-visible:ring-[3px] focus-visible:ring-ring/30",
              opt.ring,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "relative size-2 rounded-full",
                    opt.dot,
                    opt.value === "online" &&
                      "before:absolute before:inset-[-3px] before:rounded-full before:bg-income/40 before:content-[''] group-data-[state=checked]:before:animate-ping",
                  )}
                />
                <span className={cn("text-sm font-semibold", opt.color)}>{opt.label}</span>
              </span>
              <div
                className={cn(
                  siteStatusSectionContentPage.radio,
                  "group-data-[state=checked]:border-current",
                  opt.color,
                )}
              >
                <RadioGroupPrimitive.Indicator className={siteStatusSectionContentPage.radioInner}>
                  <div className={cn("size-1.5 rounded-full", opt.dot)} />
                </RadioGroupPrimitive.Indicator>
              </div>
            </div>
            <p className={siteStatusSectionContentPage.optionHint}>{opt.description}</p>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </SettingsSectionShell>
  );
}
