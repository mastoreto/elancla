import { BellRing, Plus } from "lucide-react";
import type { NotificationSetting } from "@/app/(dashboard)/settings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsSectionShell } from "./settings-section-shell";

interface NotificationsPanelProps {
  notifications: NotificationSetting[];
}

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
  const enabledCount = notifications.filter((notification) => notification.enabled).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]">
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
          <article
            key={notification.id}
            className="rounded-2xl border border-border/60 bg-background/70 p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-muted-foreground text-sm">{notification.description}</p>
              </div>
              <Badge variant={notification.enabled ? "default" : "secondary"}>
                {notification.enabled ? "Activa" : "Inactiva"}
              </Badge>
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
      </div>
    </div>
  );
}
