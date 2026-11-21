"use client";

import {
  BLOG_POST_EXCERPT_MAX_LENGTH,
  BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH,
  BLOG_POST_SEO_TITLE_MAX_LENGTH,
  BLOG_POST_SLUG_MAX_LENGTH,
  BLOG_POST_TITLE_MAX_LENGTH,
} from "@ancla/contracts";
import {
  BoardFormDivider,
  BoardFormSection,
  BoardInput,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import type { PostTranslationField, PostTranslationValues } from "../../types";
import { BlogEditor } from "../blog-editor";

const EXCERPT_ROWS = 3;
const SEO_DESCRIPTION_ROWS = 3;

const postTranslationFieldsBlogPage = {
  bodyLabel: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  bodyError: cn("text-xs font-semibold text-primary"),
  counter: cn("text-right text-xs text-[var(--tinta-apagada)]"),
  counterOver: cn("font-semibold text-primary"),
};

interface PostTranslationFieldsProps {
  /** Prefix of the field ids; unique per language. */
  locale: string;
  values: PostTranslationValues;
  errors: Partial<Record<PostTranslationField, string>>;
  disabled: boolean;
  /** The slug of a language already published is part of its URL and cannot change. */
  slugLocked: boolean;
  onTitleChange: (title: string) => void;
  onChange: (patch: Partial<PostTranslationValues>) => void;
}

/** The fields of one language of a post. */
export function PostTranslationFields({
  locale,
  values,
  errors,
  disabled,
  slugLocked,
  onTitleChange,
  onChange,
}: PostTranslationFieldsProps) {
  const excerptOver = values.excerpt.length > BLOG_POST_EXCERPT_MAX_LENGTH;
  const seoOver = values.seoDescription.length > BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH;
  return (
    <>
      <BoardFormSection>
        <BoardInput
          data-testid="post-title"
          disabled={disabled}
          error={errors.title}
          id={`post-title-${locale}`}
          label="Título"
          maxLength={BLOG_POST_TITLE_MAX_LENGTH}
          onChange={(event) => onTitleChange(event.target.value)}
          value={values.title}
        />
        <BoardInput
          data-testid="post-slug"
          disabled={disabled || slugLocked}
          error={errors.slug}
          hint={
            slugLocked
              ? "Este idioma ya está publicado: su slug es parte de la dirección y no puede cambiar."
              : "La dirección del artículo. Se genera desde el título; puedes cambiarla hasta publicarlo."
          }
          id={`post-slug-${locale}`}
          label="Slug"
          maxLength={BLOG_POST_SLUG_MAX_LENGTH}
          onChange={(event) => onChange({ slug: event.target.value, slugEdited: true })}
          value={values.slug}
        />
        <BoardTextarea
          data-testid="post-excerpt"
          disabled={disabled}
          error={errors.excerpt}
          id={`post-excerpt-${locale}`}
          label="Extracto"
          onChange={(event) => onChange({ excerpt: event.target.value })}
          rows={EXCERPT_ROWS}
          value={values.excerpt}
        />
        <span
          aria-live="polite"
          className={cn(
            postTranslationFieldsBlogPage.counter,
            excerptOver && postTranslationFieldsBlogPage.counterOver,
          )}
        >
          {values.excerpt.length}/{BLOG_POST_EXCERPT_MAX_LENGTH}
        </span>
        <div data-testid="post-body">
          <span className={postTranslationFieldsBlogPage.bodyLabel}>Contenido</span>
          <BlogEditor
            disabled={disabled}
            hasError={Boolean(errors.body)}
            onChange={(body) => onChange({ body })}
            value={values.body}
          />
          {errors.body ? (
            <p className={postTranslationFieldsBlogPage.bodyError}>{errors.body}</p>
          ) : null}
        </div>
        <BoardInput
          data-testid="post-tags"
          disabled={disabled}
          error={errors.tags}
          hint="Separadas por comas."
          id={`post-tags-${locale}`}
          label="Etiquetas (opcional)"
          onChange={(event) => onChange({ tagsText: event.target.value })}
          value={values.tagsText}
        />
      </BoardFormSection>
      <BoardFormDivider />
      <BoardFormSection>
        <BoardInput
          data-testid="post-seo-title"
          disabled={disabled}
          error={errors.seoTitle}
          id={`post-seo-title-${locale}`}
          label="Título SEO (opcional)"
          maxLength={BLOG_POST_SEO_TITLE_MAX_LENGTH}
          onChange={(event) => onChange({ seoTitle: event.target.value })}
          value={values.seoTitle}
        />
        <BoardTextarea
          data-testid="post-seo-description"
          disabled={disabled}
          error={errors.seoDescription}
          id={`post-seo-description-${locale}`}
          label="Descripción SEO (opcional)"
          onChange={(event) => onChange({ seoDescription: event.target.value })}
          rows={SEO_DESCRIPTION_ROWS}
          value={values.seoDescription}
        />
        <span
          aria-live="polite"
          className={cn(
            postTranslationFieldsBlogPage.counter,
            seoOver && postTranslationFieldsBlogPage.counterOver,
          )}
        >
          {values.seoDescription.length}/{BLOG_POST_SEO_DESCRIPTION_MAX_LENGTH}
        </span>
      </BoardFormSection>
    </>
  );
}
