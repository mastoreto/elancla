"use client";

import { Check, Church, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardInput } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";

const churchIdentityCardSettingsPage = {
  body: cn("flex flex-col gap-6 sm:flex-row sm:items-start"),
  avatar: cn("flex flex-col items-center gap-2.5"),
  logo: cn(
    "flex size-[110px] items-center justify-center rounded-[34px] bg-(image:--grad-granada) text-white",
    "shadow-[0_18px_30px_-16px_rgba(194,58,78,0.9)]",
  ),
  logoIcon: cn("size-[52px]"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  fields: cn("flex flex-1 flex-col gap-3.5"),
  footer: cn("flex justify-end"),
  icon: cn("size-4"),
};

interface ChurchIdentityCardProps {
  initialName: string;
  initialSubtitle: string;
}

export function ChurchIdentityCard({ initialName, initialSubtitle }: ChurchIdentityCardProps) {
  const [name, setName] = useState(initialName);
  const [subtitle, setSubtitle] = useState(initialSubtitle);

  // Seed-data screen: the toast stands in for the real save.
  const save = () => toast.success("Identidad de la iglesia actualizada");

  return (
    <BoardCard>
      <BoardCardHeader
        subtitle="Nombre, subtítulo e imagen que ve todo el equipo"
        title="Identidad institucional"
      />
      <div className={churchIdentityCardSettingsPage.body}>
        <div className={churchIdentityCardSettingsPage.avatar}>
          <span className={churchIdentityCardSettingsPage.logo}>
            <Church aria-hidden="true" className={churchIdentityCardSettingsPage.logoIcon} />
          </span>
          <BoardButton size="sm" variant="soft">
            <Upload aria-hidden="true" className={churchIdentityCardSettingsPage.icon} />
            Cambiar imagen
          </BoardButton>
          <span className={churchIdentityCardSettingsPage.hint}>Imagen de perfil</span>
        </div>
        <div className={churchIdentityCardSettingsPage.fields}>
          <BoardInput
            id="church-name"
            label="Nombre"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          <BoardInput
            id="church-subtitle"
            label="Subtítulo"
            onChange={(event) => setSubtitle(event.target.value)}
            value={subtitle}
          />
          <div className={churchIdentityCardSettingsPage.footer}>
            <BoardButton onClick={save} variant="primary">
              <Check aria-hidden="true" className={churchIdentityCardSettingsPage.icon} />
              Guardar cambios
            </BoardButton>
          </div>
        </div>
      </div>
    </BoardCard>
  );
}
