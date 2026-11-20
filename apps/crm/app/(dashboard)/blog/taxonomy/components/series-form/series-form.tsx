"use client";

import {
  BLOG_POST_SLUG_MAX_LENGTH,
  SERIES_DESCRIPTION_MAX_LENGTH,
  SERIES_NAME_MAX_LENGTH,
  type SeriesDto,
} from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormFooter,
  BoardFormSection,
  BoardInput,
  BoardTextarea,
} from "@/components/dashboard/board/board-form";
import { apiClient } from "@/lib/api/apiClient";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { useTaxonomyRequest } from "../../hooks/useTaxonomyRequest";
import type { SeriesTranslationValues, SiteLocales } from "../../types";
import { hasTaxonomyErrors } from "../../utils/mapTranslationIssues";
import {
  toSeriesFormValues,
  toUpdateSeriesBody,
  toUpsertSeriesBody,
  validateSeriesForm,
} from "../../utils/seriesFormValues";

const DESCRIPTION_ROWS = 3;

const seriesFormBlogPage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
  counter: cn("text-right text-xs text-[var(--tinta-apagada)]"),
  counterOver: cn("font-semibold text-primary"),
};

interface SeriesFormProps {
  /** `null` creates a new series. */
  series: SeriesDto | null;
  site: SiteLocales;
  onDone: () => void;
}

/** Create or edit one series: its name, slug and description in every language. */
export function SeriesForm({ series, site, onDone }: SeriesFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toSeriesFormValues(series, locales));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useTaxonomyRequest();

  const errors = validateSeriesForm(values, defaultLocale);
  const localeErrors = showErrors ? (errors.translations[activeLocale] ?? {}) : {};
  const active = values.translations[activeLocale];
  const incompleteLocales = locales.filter(
    (locale) => (values.translations[locale]?.name ?? "").trim() === "",
  );

  const patchActive = (patch: Partial<SeriesTranslationValues>) =>
    setValues((previous) => {
      const current = previous.translations[activeLocale];
      if (!current) return previous;
      return {
        translations: { ...previous.translations, [activeLocale]: { ...current, ...patch } },
      };
    });

  // The slug follows the name until the user types one by hand.
  const updateName = (name: string) =>
    patchActive({ name, ...(active?.slugEdited ? {} : { slug: slugify(name) }) });

  async function submit(): Promise<void> {
    if (hasTaxonomyErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.translations[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    const worked = await run(
      () =>
        series
          ? apiClient.content.series[":id"].$patch({
              param: { id: series.id },
              json: toUpdateSeriesBody(values, defaultLocale, series.version),
            })
          : apiClient.content.series.$post({ json: toUpsertSeriesBody(values, defaultLocale) }),
      series ? "Serie actualizada" : "Serie creada",
    );
    if (worked) onDone();
  }

  const descriptionLength = active?.description.length ?? 0;

  return (
    <div className={seriesFormBlogPage.container} data-testid="series-form">
      <BoardFormSection>
        <LocaleTabs
          defaultLocale={defaultLocale}
          incompleteLocales={incompleteLocales}
          label="Idioma de la serie"
          locales={locales}
          onChange={setActiveLocale}
          value={activeLocale}
        />
        {active ? (
          <>
            <BoardInput
              data-testid="series-name"
              error={localeErrors.name}
              id={`series-name-${activeLocale}`}
              label="Nombre"
              maxLength={SERIES_NAME_MAX_LENGTH}
              onChange={(event) => updateName(event.target.value)}
              value={active.name}
            />
            <BoardInput
              data-testid="series-slug"
              error={localeErrors.slug}
              hint="Se genera desde el nombre; puedes cambiarlo."
              id={`series-slug-${activeLocale}`}
              label="Slug"
              maxLength={BLOG_POST_SLUG_MAX_LENGTH}
              onChange={(event) => patchActive({ slug: event.target.value, slugEdited: true })}
              value={active.slug}
            />
            <BoardTextarea
              data-testid="series-description"
              error={localeErrors.description}
              id={`series-description-${activeLocale}`}
              label="Descripción (opcional)"
              onChange={(event) => patchActive({ description: event.target.value })}
              rows={DESCRIPTION_ROWS}
              value={active.description}
            />
            <span
              aria-live="polite"
              className={cn(
                seriesFormBlogPage.counter,
                descriptionLength > SERIES_DESCRIPTION_MAX_LENGTH && seriesFormBlogPage.counterOver,
              )}
            >
              {descriptionLength}/{SERIES_DESCRIPTION_MAX_LENGTH}
            </span>
          </>
        ) : null}
      </BoardFormSection>
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="series-save"
          disabled={busy}
          onClick={() => void submit()}
          variant="primary"
        >
          {busy ? "Guardando…" : "Guardar"}
        </BoardButton>
      </BoardFormFooter>
    </div>
  );
}
