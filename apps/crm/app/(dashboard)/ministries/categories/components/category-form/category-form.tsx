"use client";

import { MINISTRY_CATEGORY_NAME_MAX_LENGTH, type MinistryCategoryDto } from "@ancla/contracts";
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
import { cn } from "@/lib/utils";
import { useMinistryRequest } from "../../../hooks/useMinistryRequest";
import type { SiteLocales } from "../../types";
import {
  hasCategoryErrors,
  toCategoryFormValues,
  toUpdateCategoryBody,
  toUpsertCategoryBody,
  validateCategoryForm,
} from "../../utils/categoryFormValues";

const categoryFormMinistriesPage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
};

interface CategoryFormProps {
  /** `null` creates a new category. */
  category: MinistryCategoryDto | null;
  site: SiteLocales;
  /** The order a new category starts with: after the existing ones. */
  nextOrder: number;
  onDone: () => void;
}

/** Create or edit one category: its order and its name in every language. */
export function CategoryForm({ category, site, nextOrder, onDone }: CategoryFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toCategoryFormValues(category, locales, nextOrder));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useMinistryRequest();

  const errors = validateCategoryForm(values, defaultLocale);
  const incompleteLocales = locales.filter((locale) => (values.names[locale] ?? "").trim() === "");

  async function submit(): Promise<void> {
    if (hasCategoryErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.names[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    const worked = await run(
      () =>
        category
          ? apiClient.content["ministry-categories"][":id"].$patch({
              param: { id: category.id },
              json: toUpdateCategoryBody(values, defaultLocale, category.version),
            })
          : apiClient.content["ministry-categories"].$post({
              json: toUpsertCategoryBody(values, defaultLocale),
            }),
      category ? "Categoría actualizada" : "Categoría creada",
    );
    if (worked) onDone();
  }

  return (
    <div className={categoryFormMinistriesPage.container} data-testid="ministry-category-form">
      <BoardFormSection>
        <BoardFormRow>
          <BoardInput
            data-testid="ministry-category-order"
            error={showErrors ? errors.order : undefined}
            hint="Los números más bajos salen primero."
            id="ministry-category-order"
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
        <BoardInput
          data-testid="ministry-category-name"
          error={showErrors ? errors.names[activeLocale] : undefined}
          id={`ministry-category-name-${activeLocale}`}
          label="Nombre"
          maxLength={MINISTRY_CATEGORY_NAME_MAX_LENGTH}
          onChange={(event) =>
            setValues({ ...values, names: { ...values.names, [activeLocale]: event.target.value } })
          }
          value={values.names[activeLocale] ?? ""}
        />
      </BoardFormSection>
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="ministry-category-save"
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
