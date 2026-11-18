"use client";

import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SettingsSectionShell } from "@/app/(dashboard)/settings/components/settings-section-shell";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updateAbout } from "../actions";

export function AboutSection({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateAbout(content);
        toast.success("Sección «Sobre nosotros» actualizada");
      } catch {
        toast.error("No se pudo actualizar la sección «Sobre nosotros»");
      }
    });
  };

  return (
    <SettingsSectionShell
      title="Sobre nosotros"
      description="Texto que se muestra en la sección de presentación del sitio web de la iglesia."
      action={
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="size-3.5" />
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
      }
    >
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Cuéntale a los visitantes quiénes son, cuál es su misión y visión…"
        minHeight="280px"
      />
    </SettingsSectionShell>
  );
}
