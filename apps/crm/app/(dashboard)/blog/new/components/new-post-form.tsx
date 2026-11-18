"use client";

import { CalendarDays } from "lucide-react";
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
import { RichTextEditor } from "@/components/RichTextEditor";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { BlogAuthor, BlogCategory } from "../../types";
import { type NewPostFormErrors, type NewPostFormValues, newPostSchema } from "../schema";

const EMPTY_VALUES: NewPostFormValues = {
  title: "",
  description: "",
  heroImage: "",
  categoryId: "",
  publishedAt: "",
  tags: [],
  content: "",
};

const newPostFormContentPage = {
  editor: cn("flex w-full flex-col gap-[7px]"),
  editorLabel: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  error: cn("text-xs font-semibold text-primary"),
  author: cn("flex items-center gap-3"),
  avatar: cn(
    "inline-flex size-10 items-center justify-center rounded-full bg-(image:--grad-avatar) text-[13px] font-extrabold text-[var(--oro-texto)]",
  ),
  authorText: cn("flex flex-col"),
  authorName: cn("text-sm font-semibold"),
  authorHint: cn("text-xs text-[var(--tinta-apagada)]"),
  dateIcon: cn("size-[18px] shrink-0 text-[var(--tinta-apagada)]"),
};

interface NewPostFormProps {
  author: BlogAuthor;
  categories: BlogCategory[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function NewPostForm({ author, categories }: NewPostFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<NewPostFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<NewPostFormErrors>({});

  const update = <K extends keyof NewPostFormValues>(field: K, value: NewPostFormValues[K]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const goToList = () => router.push(getChurchRoutePath("blog"));

  // Seed-data screen: validating and going back to the list stands in for the real save.
  const publish = () => {
    const result = newPostSchema.safeParse(values);
    if (!result.success) {
      const next: NewPostFormErrors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof NewPostFormErrors] ??= issue.message;
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
        title="Nuevo artículo"
      >
        <BoardFormSections>
          <BoardFormSection>
            <BoardInput
              error={errors.title}
              id="post-title"
              label="Título *"
              onChange={(event) => update("title", event.target.value)}
              placeholder="Una iglesia que camina junta"
              value={values.title}
            />
            <BoardTextarea
              error={errors.description}
              id="post-description"
              label="Descripción breve *"
              onChange={(event) => update("description", event.target.value)}
              placeholder="Resume el artículo en una o dos frases"
              value={values.description}
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <ContentImageDropzone
              error={errors.heroImage}
              fileName={values.heroImage}
              hint="JPG o PNG · 1600×900"
              id="post-hero"
              label="Imagen hero *"
              onFileNameChange={(name) => update("heroImage", name)}
              title="Arrastra una imagen"
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <BoardFormRow>
              <BoardSelect
                error={errors.categoryId}
                id="post-category"
                label="Categoría *"
                onValueChange={(value) => update("categoryId", value)}
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.label,
                }))}
                placeholder="Elegir categoría"
                value={values.categoryId}
              />
              <BoardInput
                error={errors.publishedAt}
                icon={
                  <CalendarDays aria-hidden="true" className={newPostFormContentPage.dateIcon} />
                }
                id="post-date"
                label="Fecha de publicación *"
                onChange={(event) => update("publishedAt", event.target.value)}
                type="date"
                value={values.publishedAt}
              />
            </BoardFormRow>
            <ContentChipInput
              error={errors.tags}
              hint="Presiona Enter o coma para agregar"
              id="post-tags"
              label="Tags *"
              onValuesChange={(tags) => update("tags", tags)}
              values={values.tags}
              variant="tag"
            />
          </BoardFormSection>

          <BoardFormDivider />

          <BoardFormSection>
            <div className={newPostFormContentPage.editor}>
              <span className={newPostFormContentPage.editorLabel}>Contenido *</span>
              <RichTextEditor
                hasError={Boolean(errors.content)}
                onChange={(html) => update("content", html)}
                placeholder="Escribe el contenido del artículo aquí..."
                value={values.content}
              />
              {errors.content ? (
                <span className={newPostFormContentPage.error}>{errors.content}</span>
              ) : null}
            </div>
          </BoardFormSection>

          <BoardFormDivider />

          <div className={newPostFormContentPage.author}>
            <span className={newPostFormContentPage.avatar}>{getInitials(author.name)}</span>
            <div className={newPostFormContentPage.authorText}>
              <b className={newPostFormContentPage.authorName}>Autor: {author.name}</b>
              <span className={newPostFormContentPage.authorHint}>Sesión actual</span>
            </div>
          </div>
        </BoardFormSections>

        <ContentFormActions
          cancelHref={getChurchRoutePath("blog")}
          onPublish={publish}
          onSaveDraft={goToList}
          publishLabel="Publicar artículo"
        />
      </BoardFormCard>
    </form>
  );
}
