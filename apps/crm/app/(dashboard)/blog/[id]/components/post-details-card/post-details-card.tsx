"use client";

import { BLOG_POST_SERIES_ORDER_MAX } from "@ancla/contracts";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
  type BoardSelectOption,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import type { PostFormErrors, PostFormOptions, PostFormValues, SiteLocales } from "../../types";
import { PostCoverField } from "../post-cover-field";
import { PostRelatedField } from "../post-related-field";

/** A select cannot hold an empty value, so "no series" travels as this one. */
const NO_SERIES = "none";

/** The name in the default language, else the first one the entity has. */
function nameIn(translations: Record<string, { name: string }>, defaultLocale: string): string {
  return translations[defaultLocale]?.name ?? Object.values(translations)[0]?.name ?? "—";
}

interface PostDetailsCardProps {
  values: PostFormValues;
  options: PostFormOptions;
  site: SiteLocales;
  errors: PostFormErrors["general"];
  disabled: boolean;
  onChange: (patch: Partial<PostFormValues>) => void;
}

/** What does not change with the language: author, taxonomy, cover, dates and related posts. */
export function PostDetailsCard({
  values,
  options,
  site,
  errors,
  disabled,
  onChange,
}: PostDetailsCardProps) {
  const authorOptions: BoardSelectOption[] = options.authors.map((author) => ({
    value: author.id,
    label: author.name,
  }));
  const categoryOptions: BoardSelectOption[] = options.categories.map((category) => ({
    value: category.id,
    label: nameIn(category.translations, site.defaultLocale),
  }));
  const seriesOptions: BoardSelectOption[] = [
    { value: NO_SERIES, label: "Sin serie" },
    ...options.series.map((series) => ({
      value: series.id,
      label: nameIn(series.translations, site.defaultLocale),
    })),
  ];

  return (
    <BoardFormCard
      subtitle="Quién lo escribió, dónde se clasifica, su portada y cuándo se publica."
      title="Detalles del artículo"
    >
      <BoardFormSections>
        <BoardFormSection>
          <BoardFormRow>
            <BoardSelect
              disabled={disabled}
              error={errors.authorProfileId}
              hint={
                authorOptions.length === 0
                  ? "No hay autores: marca a una persona como «Autor del blog» en Sitio web → Personas."
                  : undefined
              }
              id="post-author"
              label="Autor"
              onValueChange={(authorProfileId) => onChange({ authorProfileId })}
              options={authorOptions}
              placeholder="Elige un autor"
              value={values.authorProfileId}
            />
            <BoardSelect
              disabled={disabled}
              error={errors.categoryId}
              id="post-category"
              label="Categoría"
              onValueChange={(categoryId) => onChange({ categoryId })}
              options={categoryOptions}
              placeholder="Elige una categoría"
              value={values.categoryId}
            />
          </BoardFormRow>
          <BoardFormRow>
            <BoardSelect
              disabled={disabled}
              id="post-series"
              label="Serie"
              onValueChange={(seriesId) =>
                onChange({
                  seriesId: seriesId === NO_SERIES ? "" : seriesId,
                  seriesOrder: seriesId === NO_SERIES ? "" : values.seriesOrder,
                })
              }
              options={seriesOptions}
              value={values.seriesId === "" ? NO_SERIES : values.seriesId}
            />
            {values.seriesId === "" ? null : (
              <BoardInput
                data-testid="post-series-order"
                disabled={disabled}
                error={errors.seriesOrder}
                id="post-series-order"
                inputMode="numeric"
                label="Posición en la serie"
                max={BLOG_POST_SERIES_ORDER_MAX}
                min={1}
                onChange={(event) => onChange({ seriesOrder: event.target.value })}
                type="number"
                value={values.seriesOrder}
              />
            )}
          </BoardFormRow>
          <BoardSwitchRow
            checked={values.featured}
            disabled={disabled}
            hint="Aparece en el bloque principal del blog."
            onCheckedChange={(featured) => onChange({ featured })}
            title="Artículo destacado"
          />
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <PostCoverField
            cover={values.cover}
            disabled={disabled}
            error={errors.cover}
            onChange={(patch) => onChange({ cover: { ...values.cover, ...patch } })}
          />
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <BoardFormRow>
            <BoardInput
              data-testid="post-written-at"
              disabled={disabled}
              error={errors.writtenAt}
              id="post-written-at"
              label="Fecha en que se escribió"
              onChange={(event) => onChange({ writtenAt: event.target.value })}
              type="date"
              value={values.writtenAt}
            />
            <BoardInput
              data-testid="post-publish-at"
              disabled={disabled}
              error={errors.publishAt}
              hint="Déjala vacía para publicar apenas se apruebe. Con fecha futura queda programado."
              id="post-publish-at"
              label="Publicación programada (opcional)"
              onChange={(event) => onChange({ publishAt: event.target.value })}
              type="datetime-local"
              value={values.publishAt}
            />
          </BoardFormRow>
        </BoardFormSection>
        <BoardFormDivider />
        <BoardFormSection>
          <PostRelatedField
            disabled={disabled}
            error={errors.relatedPostIds}
            onChange={(relatedPostIds) => onChange({ relatedPostIds })}
            options={options.relatable}
            selectedIds={values.relatedPostIds}
          />
        </BoardFormSection>
      </BoardFormSections>
    </BoardFormCard>
  );
}
