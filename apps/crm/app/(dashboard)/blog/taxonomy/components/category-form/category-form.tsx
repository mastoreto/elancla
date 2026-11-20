"use client";

import {
  BLOG_POST_SLUG_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  type CategoryDto,
} from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardInput,
} from "@/components/dashboard/board/board-form";
import { apiClient } from "@/lib/api/apiClient";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { useTaxonomyRequest } from "../../hooks/useTaxonomyRequest";
import type { CategoryTranslationValues, SiteLocales } from "../../types";
import {
  toCategoryFormValues,
  toUpdateCategoryBody,
  toUpsertCategoryBody,
  validateCategoryForm,
} from "../../utils/categoryFormValues";
import { hasTaxonomyErrors } from "../../utils/mapTranslationIssues";

const categoryFormBlogPage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
};

interface CategoryFormProps {
  /** `null` creates a new category. */
  category: CategoryDto | null;
  site: SiteLocales;
  /** The order a new category starts with: after the existing ones. */
  nextOrder: number;
  onDone: () => void;
}

/** Create or edit one category: its order and its name and slug in every language. */
export function CategoryForm({ category, site, nextOrder, onDone }: CategoryFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toCategoryFormValues(category, locales, nextOrder));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useTaxonomyRequest();

  const errors = validateCategoryForm(values, defaultLocale);
  const localeErrors = showErrors ? (errors.translations[activeLocale] ?? {}) : {};
  const active = values.translations[activeLocale];
  const incompleteLocales = locales.filter(
    (locale) => (values.translations[locale]?.name ?? "").trim() === "",
  );

  const patchActive = (patch: Partial<CategoryTranslationValues>) =>
    setValues((previous) => {
      const current = previous.translations[activeLocale];
      if (!current) return previous;
      return {
        ...previous,
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
        category
          ? apiClient.content.categories[":id"].$patch({
              param: { id: category.id },
              json: toUpdateCategoryBody(values, defaultLocale, category.version),
            })
          : apiClient.content.categories.$post({
              json: toUpsertCategoryBody(values, defaultLocale),
            }),
      category ? "Categoría actualizada" : "Categoría creada",
    );
    if (worked) onDone();
  }

  return (
    <div className={categoryFormBlogPage.container} data-testid="category-form">
      <BoardFormSection>
        <BoardFormRow>
          <BoardInput
            data-testid="category-order"
            error={showErrors ? errors.order : undefined}
            hint="Los números más bajos salen primero."
            id="category-order"
            inputMode="numeric"
            label="Orden"
            onChange={(event) => setValues({ ...values, order: event.target.value })}
            value={values.order}
          />
        </BoardFormRow>
        <LocaleTabs
          defaultLocale={defaultLocale}
          incompleteLocales={incompleteLocales}
          label="Idioma de la categoría"
          locales={locales}
          onChange={setActiveLocale}
          value={activeLocale}
        />
        {active ? (
          <>
            <BoardInput
              data-testid="category-name"
              error={localeErrors.name}
              id={`category-name-${activeLocale}`}
              label="Nombre"
              maxLength={CATEGORY_NAME_MAX_LENGTH}
              onChange={(event) => updateName(event.target.value)}
              value={active.name}
            />
            <BoardInput
              data-testid="category-slug"
              error={localeErrors.slug}
              hint="Se genera desde el nombre; puedes cambiarlo."
              id={`category-slug-${activeLocale}`}
              label="Slug"
              maxLength={BLOG_POST_SLUG_MAX_LENGTH}
              onChange={(event) => patchActive({ slug: event.target.value, slugEdited: true })}
              value={active.slug}
            />
          </>
        ) : null}
      </BoardFormSection>
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="category-save"
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
