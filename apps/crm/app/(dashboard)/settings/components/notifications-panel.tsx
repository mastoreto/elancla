"use client";

import { BellRing, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { NotificationSetting } from "@/app/(dashboard)/settings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { EMAIL_TEMPLATES } from "../emails/emails-registry";
import { SettingsSectionShell } from "./settings-section-shell";

interface NotificationsPanelProps {
  notifications: NotificationSetting[];
}

const notificationsPanelSettingsPage = {
  block: cn("grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]"),
  card: cn("rounded-2xl border border-border/60 bg-background/70 p-5 shadow-xs"),
  blockFlex: cn("flex flex-wrap items-start justify-between gap-3"),
};

function getChannelBadgeClass(channel: NotificationSetting["channel"]) {
  if (channel === "Sistema") {
    return "bg-secondary text-secondary-foreground";
  }

  if (channel === "Correo") {
    return "bg-secondary text-secondary-foreground";
  }

  return "bg-success-surface text-income";
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  // Toggles are local state until the Notifications API exists.
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    () => new Set(notifications.filter((notification) => notification.enabled).map(({ id }) => id)),
  );
  const enabledCount = enabledIds.size;
  const toggle = (id: string, enabled: boolean) =>
    setEnabledIds((previous) => {
      const next = new Set(previous);
      if (enabled) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

  return (
    <div className={notificationsPanelSettingsPage.block}>
      <SettingsSectionShell
        title="Notificaciones"
        description="Mantén visibles los disparadores operativos para eventos críticos y seguimiento."
        action={
          <Button type="button" size="sm">
            <Plus className="size-4" />
            Nueva regla
          </Button>
        }
        contentClassName="space-y-4"
      >
        {notifications.map((notification) => (
          <article key={notification.id} className={notificationsPanelSettingsPage.card}>
            <div className={notificationsPanelSettingsPage.blockFlex}>
              <div className="space-y-1">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-muted-foreground text-sm">{notification.description}</p>
              </div>
              <Switch
                aria-label={`Activar ${notification.title}`}
                checked={enabledIds.has(notification.id)}
                onCheckedChange={(checked) => toggle(notification.id, checked)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className={getChannelBadgeClass(notification.channel)}>
                {notification.channel}
              </Badge>
              <Badge variant="outline">{notification.audience}</Badge>
              <Badge variant="outline">{notification.frequency}</Badge>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm">
                Editar regla
              </Button>
              <Button type="button" variant="ghost" size="sm">
                Ver historial
              </Button>
            </div>
          </article>
        ))}
      </SettingsSectionShell>

      <div className="space-y-6">
        <SettingsSectionShell
          title="Cobertura"
          description="Resumen visible de la estrategia de comunicación."
          contentClassName="space-y-4"
        >
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <BellRing className="size-4 text-primary" />
              Reglas activas
            </div>
            <p className="text-2xl font-semibold">{enabledCount}</p>
            <p className="text-muted-foreground text-sm">
              Flujos listos para cierre, aprobación y observaciones administrativas.
            </p>
          </div>
        </SettingsSectionShell>
        <SettingsSectionShell
          title="Plantillas de correo"
          description="Vista previa de los correos que envía el sistema."
          contentClassName="flex flex-wrap gap-2"
        >
          {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
            <Button asChild={true} key={key} size="sm" variant="outline">
              <Link href={getChurchRoutePath("settings", "emails", key)}>{template.label}</Link>
            </Button>
          ))}
        </SettingsSectionShell>
      </div>
    </div>
  );
}
