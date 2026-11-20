"use client";

import {
  SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH,
  SIMPLE_PAGE_SEO_TITLE_MAX_LENGTH,
  SIMPLE_PAGE_SLUG_MAX_LENGTH,
  SIMPLE_PAGE_TITLE_MAX_LENGTH,
} from "@ancla/contracts";
import {
  BoardFormDivider,
  BoardFormSection,
  BoardInput,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";
import type { PageTranslationField, PageTranslationValues } from "../../types";

const SEO_DESCRIPTION_ROWS = 3;

const pageTranslationFieldsWebsitePage = {
  bodyLabel: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  bodyError: cn("text-xs font-semibold text-primary"),
  counter: cn("text-right text-xs text-[var(--tinta-apagada)]"),
  counterOver: cn("font-semibold text-primary"),
};

interface PageTranslationFieldsProps {
  /** Prefix of the field ids; unique per language. */
  locale: string;
  values: PageTranslationValues;
  errors: Partial<Record<PageTranslationField, string>>;
  disabled: boolean;
  onTitleChange: (title: string) => void;
  onChange: (patch: Partial<PageTranslationValues>) => void;
}

/** The fields of one language of a page. */
export function PageTranslationFields({
  locale,
  values,
  errors,
  disabled,
  onTitleChange,
  onChange,
}: PageTranslationFieldsProps) {
  const seoOver = values.seoDescription.length > SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH;
  return (
    <>
      <BoardFormSection>
        <BoardInput
          data-testid="page-title"
          disabled={disabled}
          error={errors.title}
          id={`page-title-${locale}`}
          label="Título"
          maxLength={SIMPLE_PAGE_TITLE_MAX_LENGTH}
          onChange={(event) => onTitleChange(event.target.value)}
          value={values.title}
        />
        <BoardInput
          data-testid="page-slug"
          disabled={disabled}
          error={errors.slug}
          hint="La dirección de la página en el sitio. Se genera desde el título; puedes cambiarla."
          id={`page-slug-${locale}`}
          label="Slug"
          maxLength={SIMPLE_PAGE_SLUG_MAX_LENGTH}
          onChange={(event) => onChange({ slug: event.target.value, slugEdited: true })}
          value={values.slug}
        />
        <div data-testid="page-body">
          <span className={pageTranslationFieldsWebsitePage.bodyLabel}>Contenido</span>
          <RichTextEditor
            disabled={disabled}
            format="json"
            hasError={Boolean(errors.body)}
            onChange={(body) => onChange({ body })}
            value={values.body}
          />
          {errors.body ? (
            <p className={pageTranslationFieldsWebsitePage.bodyError}>{errors.body}</p>
          ) : null}
        </div>
      </BoardFormSection>
      <BoardFormDivider />
      <BoardFormSection>
        <BoardInput
          data-testid="page-seo-title"
          disabled={disabled}
          error={errors.seoTitle}
          id={`page-seo-title-${locale}`}
          label="Título SEO (opcional)"
          maxLength={SIMPLE_PAGE_SEO_TITLE_MAX_LENGTH}
          onChange={(event) => onChange({ seoTitle: event.target.value })}
          value={values.seoTitle}
        />
        <BoardTextarea
          data-testid="page-seo-description"
          disabled={disabled}
          error={errors.seoDescription}
          id={`page-seo-description-${locale}`}
          label="Descripción SEO (opcional)"
          onChange={(event) => onChange({ seoDescription: event.target.value })}
          rows={SEO_DESCRIPTION_ROWS}
          value={values.seoDescription}
        />
        <span
          aria-live="polite"
          className={cn(
            pageTranslationFieldsWebsitePage.counter,
            seoOver && pageTranslationFieldsWebsitePage.counterOver,
          )}
        >
          {values.seoDescription.length}/{SIMPLE_PAGE_SEO_DESCRIPTION_MAX_LENGTH}
        </span>
      </BoardFormSection>
    </>
  );
}
