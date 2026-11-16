import { Church, ImagePlus, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ChurchConfig, getChurchInitials, getChurchRoutePath } from "@/lib/church";
import { SettingsSectionShell } from "./settings-section-shell";

interface ChurchSettingsPanelProps {
  church: ChurchConfig;
}

export function ChurchSettingsPanel({ church }: ChurchSettingsPanelProps) {
  const mainAccessPath = getChurchRoutePath("resume");

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
      <SettingsSectionShell
        title="Iglesia"
        description="Define la identidad visible del sistema y deja preparada la configuración institucional para futuras integraciones."
        contentClassName="space-y-6"
      >
        <FieldGroup className="grid gap-4 md:grid-cols-2 [&>[data-slot=field]]:gap-2">
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="church-name">Nombre</FieldLabel>
            <Input id="church-name" defaultValue={church.name} />
            <FieldDescription>
              Este nombre se utilizará para branding, accesos y encabezados del sistema.
            </FieldDescription>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="church-profile-image">Imagen de Perfil</FieldLabel>
            <Input id="church-profile-image" type="file" accept="image/*" />
            <FieldDescription>
              Carga una imagen institucional para mostrarla en el sidebar y pantallas clave.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </SettingsSectionShell>

      <div className="space-y-6">
        <SettingsSectionShell
          title="Identidad visible"
          description="Vista institucional preparada para menús y encabezados."
          contentClassName="space-y-4"
        >
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/80 p-4">
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={church.profileImageUrl} alt={church.name} />
              <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
                {getChurchInitials(church.name) || <Church className="size-5" />}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Activa</Badge>
              <p className="font-semibold">{church.name}</p>
              <p className="text-muted-foreground text-sm">Identidad institucional principal</p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <ImagePlus className="size-4 text-primary" />
              Recomendación visual
            </div>
            <p className="text-muted-foreground text-sm">
              Usa una imagen cuadrada para mantener consistencia en sidebar, accesos y reportes.
            </p>
          </div>
        </SettingsSectionShell>

        <SettingsSectionShell
          title="Ruta institucional"
          description="Slug operativo definido para la navegación principal."
          contentClassName="space-y-4"
        >
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Link2 className="size-4 text-primary" />
              Acceso principal
            </div>
            <p className="rounded-lg bg-background px-3 py-2 font-mono text-sm">{mainAccessPath}</p>
            <p className="text-muted-foreground mt-3 text-sm">
              El slug institucional se aplica sobre la navegación del sistema para módulos, vistas y
              detalle de registros.
            </p>
          </div>
        </SettingsSectionShell>
      </div>
    </div>
  );
}
