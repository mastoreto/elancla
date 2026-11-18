"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardTextarea } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { updateAbout } from "../actions";

const aboutSectionWebsitePage = {
  body: cn("flex flex-col gap-3.5"),
  footer: cn("flex justify-end"),
  icon: cn("size-4"),
};

export function AboutSection({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  const save = () => {
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
    <BoardCard>
      <BoardCardHeader
        subtitle="Lo que verán los visitantes en la sección Nosotros"
        title="Sobre nosotros"
      />
      <div className={aboutSectionWebsitePage.body}>
        <BoardTextarea
          id="about-text"
          label="Texto"
          onChange={(event) => setContent(event.target.value)}
          placeholder="Cuéntale a los visitantes quiénes son y cuál es su misión"
          rows={6}
          value={content}
        />
        <div className={aboutSectionWebsitePage.footer}>
          <BoardButton disabled={isPending} onClick={save} variant="primary">
            <Check aria-hidden="true" className={aboutSectionWebsitePage.icon} />
            {isPending ? "Guardando…" : "Guardar cambios"}
          </BoardButton>
        </div>
      </div>
    </BoardCard>
  );
}
