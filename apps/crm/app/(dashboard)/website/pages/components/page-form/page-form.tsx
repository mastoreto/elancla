"use client";

import { type EditorialStatusDto, PERMISSIONS } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormFooter,
  BoardFormSections,
} from "@/components/dashboard/board/board-form";
import { EditorialStatusBar } from "@/components/editorial/editorial-status-bar";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useSavePageDraft } from "../../hooks/useSavePageDraft";
import type { PageFormValues, PageTranslationValues, SiteLocales } from "../../types";
import { toPageFormValues, toPageSnapshot } from "../../utils/pageFormValues";
import { slugify } from "../../utils/slugify";
import { hasPageFormErrors, validatePageForm } from "../../utils/validatePageForm";
import { PageTranslationFields } from "../page-translation-fields";

const pageFormWebsitePage = {
  container: cn("flex flex-col gap-[18px]"),
};

interface PageFormProps {
  pageId: string;
  status: EditorialStatusDto;
  site: SiteLocales;
}

export function PageForm({ pageId, status, site }: PageFormProps) {
  const { locales, defaultLocale } = site;
  const access = useAccess();
  const canEdit = can(access, PERMISSIONS.pages.edit);
  // With no draft in progress the next one starts from what is published.
  const [values, setValues] = useState<PageFormValues>(() =>
    toPageFormValues((status.working ?? status.live)?.snapshot ?? null, locales),
  );
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, save } = useSavePageDraft(pageId);

  const errors = validatePageForm(values, defaultLocale);
  const activeValues = values[activeLocale];
  const sentLocales = Object.keys(toPageSnapshot(values, defaultLocale).translations);
  const incompleteLocales = locales.filter((locale) => !sentLocales.includes(locale));

  const updateTranslation = (locale: string, patch: Partial<PageTranslationValues>) =>
    setValues((previous) => {
      const current = previous[locale];
      return current ? { ...previous, [locale]: { ...current, ...patch } } : previous;
    });

  // The slug follows the title until the user types one by hand.
  const updateTitle = (locale: string, title: string) =>
    setValues((previous) => {
      const current = previous[locale];
      if (!current) return previous;
      const slug = current.slugEdited ? current.slug : slugify(title);
      return { ...previous, [locale]: { ...current, title, slug } };
    });

  async function submit(): Promise<void> {
    if (hasPageFormErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    await save(toPageSnapshot(values, defaultLocale));
  }

  return (
    <div className={pageFormWebsitePage.container}>
      <EditorialStatusBar
        contentType="simple-page"
        entityId={pageId}
        getSnapshot={() => toPageSnapshot(values, defaultLocale)}
        showSaveDraft={false}
        status={status}
      />
      <BoardFormCard
        subtitle="El contenido, la dirección y el SEO de la página en cada idioma."
        title="Contenido de la página"
      >
        <BoardFormSections>
          <LocaleTabs
            defaultLocale={defaultLocale}
            incompleteLocales={incompleteLocales}
            label="Idioma de la página"
            locales={locales}
            onChange={setActiveLocale}
            value={activeLocale}
          />
          {activeValues ? (
            <PageTranslationFields
              disabled={!canEdit}
              errors={showErrors ? (errors[activeLocale] ?? {}) : {}}
              key={activeLocale}
              locale={activeLocale}
              onChange={(patch) => updateTranslation(activeLocale, patch)}
              onTitleChange={(title) => updateTitle(activeLocale, title)}
              values={activeValues}
            />
          ) : null}
        </BoardFormSections>
        <BoardFormFooter>
          <BoardButton href={getChurchRoutePath("website", "pages")} variant="ghost">
            Volver
          </BoardButton>
          {canEdit ? (
            <BoardButton
              data-testid="page-save-draft"
              disabled={busy}
              onClick={() => void submit()}
              variant="primary"
            >
              {busy ? "Guardando…" : "Guardar borrador"}
            </BoardButton>
          ) : null}
        </BoardFormFooter>
      </BoardFormCard>
    </div>
  );
}
