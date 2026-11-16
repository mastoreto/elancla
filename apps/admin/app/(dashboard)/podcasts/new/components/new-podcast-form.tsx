"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Headphones, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { PodcastHost } from "@/app/(dashboard)/podcasts/types";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { getChurchRoutePath } from "@/lib/church";
import { type NewPodcastFormValues, newPodcastSchema } from "../schema";
import { DescriptionField } from "./fields/description-field";
import { LinkField } from "./fields/link-field";
import { ParticipantsField } from "./fields/participants-field";
import { TitleField } from "./fields/title-field";
import { HeroImageUploadField } from "./hero-image-upload-field";

interface NewPodcastFormProps {
  platformHosts: PodcastHost[];
}

export function NewPodcastForm({ platformHosts }: NewPodcastFormProps) {
  const router = useRouter();

  const form = useForm<NewPodcastFormValues>({
    resolver: zodResolver(newPodcastSchema),
    defaultValues: {
      title: "",
      description: "",
      heroImage: "",
      link: "",
      participants: [],
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: NewPodcastFormValues) => {
    // Mock save — replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.info("Nuevo episodio:", data);

    toast.success("Episodio creado", {
      description: `"${data.title}" fue guardado como borrador.`,
    });

    router.push(getChurchRoutePath("podcasts"));
  };

  const handleBack = () => router.push(getChurchRoutePath("podcasts"));

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate={true}>
        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleBack}
              aria-label="Volver a podcasts"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Headphones className="size-5 text-muted-foreground shrink-0" />
              <h1 className="text-lg font-semibold truncate">Nuevo episodio</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={handleBack}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="size-4 mr-2" />
              {isSubmitting ? "Publicando..." : "Publicar episodio"}
            </Button>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* ── Main column ──────────────────────────────────────── */}
          <div className="space-y-6">
            <TitleField control={control} />
            <DescriptionField control={control} />
            <LinkField control={control} />
          </div>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <aside className="space-y-6 lg:sticky lg:top-6">
            <HeroImageUploadField control={control} />

            <Separator />

            <ParticipantsField control={control} platformHosts={platformHosts} />
          </aside>
        </div>
      </form>
    </Form>
  );
}
