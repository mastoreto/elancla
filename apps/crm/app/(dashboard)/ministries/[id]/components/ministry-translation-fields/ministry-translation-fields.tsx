"use client";

import {
  MINISTRY_AUDIENCE_MAX_LENGTH,
  MINISTRY_COVER_ALT_MAX_LENGTH,
  MINISTRY_HOW_TO_JOIN_MAX_LENGTH,
  MINISTRY_NAME_MAX_LENGTH,
  MINISTRY_NEXT_STEP_MAX_LENGTH,
  MINISTRY_PLACE_MAX_LENGTH,
  MINISTRY_SEO_DESCRIPTION_MAX_LENGTH,
  MINISTRY_SEO_TITLE_MAX_LENGTH,
  MINISTRY_SLUG_MAX_LENGTH,
  MINISTRY_TAGLINE_MAX_LENGTH,
} from "@ancla/contracts";
import {
  BoardFormDivider,
  BoardFormRow,
  BoardFormSection,
  BoardInput,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";
import type { MinistryTranslationField, MinistryTranslationValues } from "../../types";
import { MinistryValuesField } from "../ministry-values-field";

const TEXTAREA_ROWS = 3;

const ministryTranslationFieldsMinistriesPage = {
  aboutLabel: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  aboutError: cn("text-xs font-semibold text-primary"),
  counter: cn("text-right text-xs text-[var(--tinta-apagada)]"),
  counterOver: cn("font-semibold text-primary"),
};

interface MinistryTranslationFieldsProps {
  /** Prefix of the field ids; unique per language. */
  locale: string;
  values: MinistryTranslationValues;
  errors: Partial<Record<MinistryTranslationField, string>>;
  disabled: boolean;
  /** The slug of a language already published is part of its URL and cannot change. */
  slugLocked: boolean;
  onNameChange: (name: string) => void;
  onChange: (patch: Partial<MinistryTranslationValues>) => void;
}

/** The fields of one language of a ministry profile. */
export function MinistryTranslationFields({
  locale,
  values,
  errors,
  disabled,
  slugLocked,
  onNameChange,
  onChange,
}: MinistryTranslationFieldsProps) {
  const seoOver = values.seoDescription.length > MINISTRY_SEO_DESCRIPTION_MAX_LENGTH;
  return (
    <>
      <BoardFormSection>
        <BoardInput
          data-testid="ministry-name"
          disabled={disabled}
          error={errors.name}
          id={`ministry-name-${locale}`}
          label="Nombre público"
          maxLength={MINISTRY_NAME_MAX_LENGTH}
          onChange={(event) => onNameChange(event.target.value)}
          value={values.name}
        />
        <BoardInput
          data-testid="ministry-slug"
          disabled={disabled || slugLocked}
          error={errors.slug}
          hint={
            slugLocked
              ? "Este idioma ya está publicado: su slug es parte de la dirección y no puede cambiar."
              : "La dirección del ministerio. Se genera desde el nombre; puedes cambiarla hasta publicarlo."
          }
          id={`ministry-slug-${locale}`}
          label="Slug"
          maxLength={MINISTRY_SLUG_MAX_LENGTH}
          onChange={(event) => onChange({ slug: event.target.value, slugEdited: true })}
          value={values.slug}
        />
        <BoardInput
          data-testid="ministry-tagline"
          disabled={disabled}
          error={errors.tagline}
          id={`ministry-tagline-${locale}`}
          label="Frase"
          maxLength={MINISTRY_TAGLINE_MAX_LENGTH}
          onChange={(event) => onChange({ tagline: event.target.value })}
          value={values.tagline}
        />
        <div data-testid="ministry-about">
          <span className={ministryTranslationFieldsMinistriesPage.aboutLabel}>
            Sobre el ministerio
          </span>
          <RichTextEditor
            disabled={disabled}
            format="json"
            hasError={Boolean(errors.about)}
            onChange={(about) => onChange({ about })}
            value={values.about}
          />
          {errors.about ? (
            <p className={ministryTranslationFieldsMinistriesPage.aboutError}>{errors.about}</p>
          ) : null}
        </div>
        <MinistryValuesField
          disabled={disabled}
          error={errors.values}
          locale={locale}
          onChange={(valuesList) => onChange({ values: valuesList })}
          values={values.values}
        />
      </BoardFormSection>
      <BoardFormDivider />
      <BoardFormSection>
        <BoardFormRow>
          <BoardInput
            disabled={disabled}
            error={errors.place}
            id={`ministry-place-${locale}`}
            label="Lugar (opcional)"
            maxLength={MINISTRY_PLACE_MAX_LENGTH}
            onChange={(event) => onChange({ place: event.target.value })}
            value={values.place}
          />
          <BoardInput
            disabled={disabled}
            error={errors.audience}
            id={`ministry-audience-${locale}`}
            label="Público (opcional)"
            maxLength={MINISTRY_AUDIENCE_MAX_LENGTH}
            onChange={(event) => onChange({ audience: event.target.value })}
            value={values.audience}
          />
        </BoardFormRow>
        <BoardTextarea
          disabled={disabled}
          error={errors.howToJoin}
          id={`ministry-how-to-join-${locale}`}
          label="Cómo sumarse (opcional)"
          maxLength={MINISTRY_HOW_TO_JOIN_MAX_LENGTH}
          onChange={(event) => onChange({ howToJoin: event.target.value })}
          rows={TEXTAREA_ROWS}
          value={values.howToJoin}
        />
        <BoardTextarea
          disabled={disabled}
          error={errors.nextStep}
          id={`ministry-next-step-${locale}`}
          label="Próximo paso (opcional)"
          maxLength={MINISTRY_NEXT_STEP_MAX_LENGTH}
          onChange={(event) => onChange({ nextStep: event.target.value })}
          rows={TEXTAREA_ROWS}
          value={values.nextStep}
        />
        <BoardInput
          disabled={disabled}
          error={errors.coverAlt}
          hint="Describe la portada para quien no la ve."
          id={`ministry-cover-alt-${locale}`}
          label="Texto alternativo de la portada (opcional)"
          maxLength={MINISTRY_COVER_ALT_MAX_LENGTH}
          onChange={(event) => onChange({ coverAlt: event.target.value })}
          value={values.coverAlt}
        />
      </BoardFormSection>
      <BoardFormDivider />
      <BoardFormSection>
        <BoardInput
          data-testid="ministry-seo-title"
          disabled={disabled}
          error={errors.seoTitle}
          id={`ministry-seo-title-${locale}`}
          label="Título SEO (opcional)"
          maxLength={MINISTRY_SEO_TITLE_MAX_LENGTH}
          onChange={(event) => onChange({ seoTitle: event.target.value })}
          value={values.seoTitle}
        />
        <BoardTextarea
          data-testid="ministry-seo-description"
          disabled={disabled}
          error={errors.seoDescription}
          id={`ministry-seo-description-${locale}`}
          label="Descripción SEO (opcional)"
          onChange={(event) => onChange({ seoDescription: event.target.value })}
          rows={TEXTAREA_ROWS}
          value={values.seoDescription}
        />
        <span
          aria-live="polite"
          className={cn(
            ministryTranslationFieldsMinistriesPage.counter,
            seoOver && ministryTranslationFieldsMinistriesPage.counterOver,
          )}
        >
          {values.seoDescription.length}/{MINISTRY_SEO_DESCRIPTION_MAX_LENGTH}
        </span>
      </BoardFormSection>
    </>
  );
}
