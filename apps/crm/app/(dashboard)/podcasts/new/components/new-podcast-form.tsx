"use client";

import { CalendarDays, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import {
  ContentChipInput,
  ContentFormActions,
  ContentImageDropzone,
} from "@/components/dashboard/content";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { PodcastSeries } from "../../types";
import { type NewPodcastFormErrors, type NewPodcastFormValues, newPodcastSchema } from "../schema";

const EMPTY_VALUES: NewPodcastFormValues = {
  title: "",
  description: "",
  heroImage: "",
  link: "",
  series: "",
  publishedAt: "",
  participants: [],
};

const newPodcastFormPodcastsPage = {
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
};

export function NewPodcastForm({ series }: { series: PodcastSeries[] }) {
  const router = useRouter();
  const [values, setValues] = useState<NewPodcastFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<NewPodcastFormErrors>({});

  const update = <K extends keyof NewPodcastFormValues>(field: K, value: NewPodcastFormValues[K]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const goToList = () => router.push(getChurchRoutePath("podcasts"));

  // Seed-data screen: validating and going back to the list stands in for the real save.
  const publish = () => {
    const result = newPodcastSchema.safeParse(values);
    if (!result.success) {
      const next: NewPodcastFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof NewPodcastFormErrors] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    goToList();
  };

  return (
    <form
      noValidate={true}
      onSubmit={(event) => {
        event.preventDefault();
        publish();
      }}
    >
      <BoardFormCard
        subtitle="Todo en un solo lugar: completa de arriba hacia abajo y publica"
        title="Nuevo episodio"
      >
        <BoardFormSections>
          <BoardFormSection>
            <BoardInput
              error={errors.title}
              id="podcast-title"
              label="Título *"
              onChange={(event) => update("title", event.target.value)}
              placeholder="Cuando la alabanza duele"
              value={values.title}
            />
            <BoardTextarea
              error={errors.description}
              id="podcast-description"
              label="Descripción *"
              onChange={(event) => update("description", event.target.value)}
              placeholder="De qué trata este episodio"
              value={values.description}
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <ContentImageDropzone
              error={errors.heroImage}
              fileName={values.heroImage}
              hint="Cuadrada · 1400×1400"
              id="podcast-hero"
              label="Imagen hero *"
              onFileNameChange={(name) => update("heroImage", name)}
              title="Arrastra la portada"
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardInput
              error={errors.link}
              icon={<Link2 aria-hidden="true" className={newPodcastFormPodcastsPage.icon} />}
              id="podcast-link"
              label="Link del episodio *"
              onChange={(event) => update("link", event.target.value)}
              placeholder="https://open.spotify.com/episode/…"
              value={values.link}
            />
            <BoardFormRow>
              <BoardSelect
                id="podcast-series"
                label="Serie"
                onValueChange={(value) => update("series", value)}
                options={series.map((item) => ({ value: item.id, label: item.label }))}
                placeholder="Elegir serie"
                value={values.series}
              />
              <BoardInput
                icon={
                  <CalendarDays aria-hidden="true" className={newPodcastFormPodcastsPage.icon} />
                }
                id="podcast-date"
                label="Fecha de publicación"
                onChange={(event) => update("publishedAt", event.target.value)}
                type="date"
                value={values.publishedAt}
              />
            </BoardFormRow>
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <ContentChipInput
              error={errors.participants}
              id="podcast-participants"
              label="Participantes *"
              onValuesChange={(participants) => update("participants", participants)}
              values={values.participants}
              variant="person"
            />
          </BoardFormSection>
        </BoardFormSections>

        <ContentFormActions
          cancelHref={getChurchRoutePath("podcasts")}
          onPublish={publish}
          onSaveDraft={goToList}
          publishLabel="Publicar episodio"
        />
      </BoardFormCard>
    </form>
  );
}
