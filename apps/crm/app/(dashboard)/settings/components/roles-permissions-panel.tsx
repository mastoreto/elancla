import { ShieldPlus } from "lucide-react";
import Link from "next/link";
import type { SettingsRole } from "@/app/(dashboard)/settings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { SettingsSectionShell } from "./settings-section-shell";

interface RolesPermissionsPanelProps {
  roles: SettingsRole[];
}

const rolesPermissionsPanelSettingsPage = {
  card: cn("rounded-2xl border border-border/60 bg-background/70 p-5 shadow-xs"),
  block: cn("flex flex-wrap items-start justify-between gap-3"),
  text: cn("text-muted-foreground text-xs uppercase tracking-wide"),
};

export function RolesPermissionsPanel({ roles }: RolesPermissionsPanelProps) {
  return (
    <SettingsSectionShell
      title="Roles y Permisos"
      description="Organiza perfiles operativos para limitar alcance, aprobaciones y auditoría."
      action={
        <Button asChild={true} size="sm">
          <Link href={getChurchRoutePath("settings", "roles", "new")}>
            <ShieldPlus className="size-4" />
            Nuevo rol
          </Link>
        </Button>
      }
      contentClassName="grid gap-4 lg:grid-cols-2"
    >
      {roles.map((role) => (
        <article key={role.id} className={rolesPermissionsPanelSettingsPage.card}>
          <div className={rolesPermissionsPanelSettingsPage.block}>
            <div className="space-y-1">
              <h3 className="font-semibold">{role.name}</h3>
              <p className="text-muted-foreground text-sm">{role.description}</p>
            </div>
            <Badge variant="secondary">{`${role.membersCount} asignados`}</Badge>
          </div>

          <div className="mt-4 rounded-xl bg-muted/20 p-4">
            <p className={rolesPermissionsPanelSettingsPage.text}>Alcance</p>
            <p className="mt-1 font-medium">{role.scope}</p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Permisos visibles</p>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="rounded-full px-3 py-1">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild={true} variant="outline" size="sm">
              <Link href={getChurchRoutePath("settings", "roles", role.id, "edit")}>
                Editar rol
              </Link>
            </Button>
            <Button type="button" variant="ghost" size="sm">
              Ver matriz
            </Button>
          </div>
        </article>
      ))}
    </SettingsSectionShell>
  );
}
