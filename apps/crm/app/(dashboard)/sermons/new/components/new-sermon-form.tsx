"use client";

import { BookOpen, CalendarDays, Play, Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardButton } from "@/components/dashboard/board/board-button";
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
import { ContentFormActions } from "@/components/dashboard/content";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { sermonPreachers, sermonSeries } from "../../data/sermons";
import type { SermonFormValues } from "../../types";
import { type SermonFormErrors, sermonFormSchema } from "../schema";

const EMPTY_VALUES: SermonFormValues = {
  title: "",
  preacher: "",
  passage: "",
  summary: "",
  series: "",
  date: "",
  youtubeUrl: "",
};

const newSermonFormSermonsPage = {
  icon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
  thumbnailLabel: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  thumbnailRow: cn("flex flex-wrap items-center gap-4"),
  thumbnailPreview: cn(
    "flex h-[135px] w-[240px] items-center justify-center rounded-[20px] bg-[var(--granada-50)] ring-1 ring-black/10 ring-inset",
    "bg-[repeating-linear-gradient(135deg,rgba(42,21,26,.035)_0_1px,transparent_1px_9px)]",
  ),
  playBubble: cn(
    "inline-flex size-[52px] items-center justify-center rounded-full text-primary",
    "bg-[linear-gradient(150deg,#ffe3e7,#f6b9c3)] shadow-[0_0_0_4px_rgba(255,255,255,.7),0_8px_18px_-6px_rgba(194,58,78,.35)]",
  ),
  thumbnailAside: cn("flex flex-col items-start gap-2"),
  thumbnailHint: cn("text-[13.5px] leading-normal text-[var(--tinta-suave)]"),
  uploadIcon: cn("size-4"),
};

export function NewSermonForm() {
  const router = useRouter();
  const [values, setValues] = useState<SermonFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<SermonFormErrors>({});

  const update = (field: keyof SermonFormValues, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const goToList = () => router.push(getChurchRoutePath("sermons"));

  // Seed-data screen: validating and returning to the list stands in for the real save.
  const publish = () => {
    const result = sermonFormSchema.safeParse(values);
    if (!result.success) {
      const next: SermonFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof SermonFormErrors] ??= issue.message;
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
        subtitle="Completa de arriba hacia abajo y publícalo en la biblioteca"
        title="Nuevo sermón"
      >
        <BoardFormSections>
          <BoardFormSection>
            <BoardInput
              error={errors.title}
              id="sermon-title"
              label="Título *"
              onChange={(event) => update("title", event.target.value)}
              placeholder="La gracia que nos sostiene"
              value={values.title}
            />
            <BoardFormRow>
              <BoardSelect
                error={errors.preacher}
                id="sermon-preacher"
                label="Predicador *"
                onValueChange={(value) => update("preacher", value)}
                options={sermonPreachers.map((name) => ({ value: name, label: name }))}
                placeholder="Elegir predicador"
                value={values.preacher}
              />
              <BoardInput
                error={errors.passage}
                icon={<BookOpen aria-hidden="true" className={newSermonFormSermonsPage.icon} />}
                id="sermon-passage"
                label="Pasaje bíblico *"
                onChange={(event) => update("passage", event.target.value)}
                placeholder="Efesios 2:1-10"
                value={values.passage}
              />
            </BoardFormRow>
            <BoardTextarea
              id="sermon-summary"
              label="Resumen"
              onChange={(event) => update("summary", event.target.value)}
              placeholder="Una frase que invite a escucharlo"
              value={values.summary}
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardFormRow>
              <BoardSelect
                id="sermon-series"
                label="Serie"
                onValueChange={(value) => update("series", value)}
                options={sermonSeries.map((name) => ({ value: name, label: name }))}
                placeholder="Sin serie"
                value={values.series}
              />
              <BoardInput
                error={errors.date}
                icon={<CalendarDays aria-hidden="true" className={newSermonFormSermonsPage.icon} />}
                id="sermon-date"
                label="Fecha del culto *"
                onChange={(event) => update("date", event.target.value)}
                type="date"
                value={values.date}
              />
            </BoardFormRow>
            <BoardInput
              error={errors.youtubeUrl}
              icon={<Video aria-hidden="true" className={newSermonFormSermonsPage.icon} />}
              id="sermon-youtube"
              inputMode="url"
              label="Link de YouTube *"
              onChange={(event) => update("youtubeUrl", event.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              value={values.youtubeUrl}
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <span className={newSermonFormSermonsPage.thumbnailLabel}>Miniatura</span>
            <div className={newSermonFormSermonsPage.thumbnailRow}>
              <div className={newSermonFormSermonsPage.thumbnailPreview}>
                <span className={newSermonFormSermonsPage.playBubble}>
                  <Play aria-hidden="true" className={newSermonFormSermonsPage.uploadIcon} />
                </span>
              </div>
              <div className={newSermonFormSermonsPage.thumbnailAside}>
                <span className={newSermonFormSermonsPage.thumbnailHint}>
                  La tomamos del video de YouTube. Puedes subir otra si prefieres.
                </span>
                <BoardButton size="sm" variant="soft">
                  <Upload aria-hidden="true" className={newSermonFormSermonsPage.uploadIcon} />
                  Subir miniatura
                </BoardButton>
              </div>
            </div>
          </BoardFormSection>
        </BoardFormSections>

        <ContentFormActions
          cancelHref={getChurchRoutePath("sermons")}
          onPublish={publish}
          onSaveDraft={goToList}
          publishLabel="Publicar sermón"
        />
      </BoardFormCard>
    </form>
  );
}
