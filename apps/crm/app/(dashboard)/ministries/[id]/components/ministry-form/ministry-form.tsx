"use client";

import { type EditorialStatusDto, PERMISSIONS } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
} from "@/components/dashboard/board/board-form";
import { EditorialStatusBar } from "@/components/editorial/editorial-status-bar";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { useSaveMinistryDraft } from "../../hooks/useSaveMinistryDraft";
import type { MinistryFormValues, MinistryTranslationValues, SiteLocales } from "../../types";
import { toMinistryFormValues, toMinistrySnapshot } from "../../utils/ministryFormValues";
import { hasMinistryFormErrors, validateMinistryForm } from "../../utils/validateMinistryForm";
import { MinistryImageField } from "../ministry-image-field";
import { MinistryTranslationFields } from "../ministry-translation-fields";

const ministryFormMinistriesPage = {
  container: cn("flex flex-col gap-[18px]"),
};

/** The languages the live revision already published: their slugs are part of the URL. */
function publishedLocalesOf(status: EditorialStatusDto): string[] {
  const translations = status.live?.snapshot.translations;
  return typeof translations === "object" && translations !== null ? Object.keys(translations) : [];
}

interface MinistryFormProps {
  ministryId: string;
  status: EditorialStatusDto;
  site: SiteLocales;
}

/** The public profile of a ministry: status bar, text by language, pictures and "Guardar borrador". */
export function MinistryForm({ ministryId, status, site }: MinistryFormProps) {
  const { locales, defaultLocale } = site;
  const access = useAccess();
  const canEdit = can(access, PERMISSIONS.ministryProfile.edit);
  // With no draft in progress the next one starts from what is published.
  const [values, setValues] = useState<MinistryFormValues>(() =>
    toMinistryFormValues((status.working ?? status.live)?.snapshot ?? null, locales),
  );
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, save } = useSaveMinistryDraft(ministryId);
  const publishedLocales = publishedLocalesOf(status);

  const errors = validateMinistryForm(values, defaultLocale);
  const activeValues = values.translations[activeLocale];
  const sentLocales = Object.keys(
    toMinistrySnapshot(values, defaultLocale).translations as Record<string, unknown>,
  );
  const incompleteLocales = locales.filter((locale) => !sentLocales.includes(locale));

  const updateTranslation = (locale: string, patch: Partial<MinistryTranslationValues>) =>
    setValues((previous) => {
      const current = previous.translations[locale];
      if (!current) return previous;
      return {
        ...previous,
        translations: { ...previous.translations, [locale]: { ...current, ...patch } },
      };
    });

  // The slug follows the name until the user types one by hand.
  const updateName = (locale: string, name: string) => {
    const current = values.translations[locale];
    if (!current) return;
    updateTranslation(locale, { name, ...(current.slugEdited ? {} : { slug: slugify(name) }) });
  };

  async function submit(): Promise<void> {
    if (hasMinistryFormErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.translations[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    await save(toMinistrySnapshot(values, defaultLocale));
  }

  return (
    <div className={ministryFormMinistriesPage.container}>
      <EditorialStatusBar
        contentType="ministry"
        entityId={ministryId}
        getSnapshot={() => toMinistrySnapshot(values, defaultLocale)}
        showSaveDraft={false}
        status={status}
      />
      <BoardFormCard
        subtitle="El nombre, la dirección, el texto y el SEO del ministerio en cada idioma."
        title="Perfil público"
      >
        <BoardFormSections>
          <LocaleTabs
            defaultLocale={defaultLocale}
            incompleteLocales={incompleteLocales}
            label="Idioma del perfil"
            locales={locales}
            onChange={setActiveLocale}
            value={activeLocale}
          />
          {activeValues ? (
            <MinistryTranslationFields
              disabled={!canEdit}
              errors={showErrors ? (errors.translations[activeLocale] ?? {}) : {}}
              key={activeLocale}
              locale={activeLocale}
              onChange={(patch) => updateTranslation(activeLocale, patch)}
              onNameChange={(name) => updateName(activeLocale, name)}
              slugLocked={publishedLocales.includes(activeLocale)}
              values={activeValues}
            />
          ) : null}
          <BoardFormDivider />
          <BoardFormSection>
            <BoardFormRow>
              <MinistryImageField
                disabled={!canEdit}
                error={showErrors ? errors.general.coverMediaId : undefined}
                hint="JPG, PNG, WebP o AVIF"
                id="ministry-cover"
                label="Portada"
                mediaId={values.coverMediaId}
                onChange={(coverMediaId) =>
                  setValues((previous) => ({ ...previous, coverMediaId }))
                }
                title="Arrastra la portada"
              />
              <MinistryImageField
                disabled={!canEdit}
                error={showErrors ? errors.general.socialImageId : undefined}
                hint="Opcional: sin ella se usa la portada"
                id="ministry-social-image"
                label="Imagen para redes"
                mediaId={values.socialImageId}
                onChange={(socialImageId) =>
                  setValues((previous) => ({ ...previous, socialImageId }))
                }
                title="Arrastra la imagen social"
              />
            </BoardFormRow>
          </BoardFormSection>
        </BoardFormSections>
        <BoardFormFooter>
          <BoardButton href={getChurchRoutePath("ministries")} variant="ghost">
            Volver
          </BoardButton>
          {canEdit ? (
            <BoardButton
              data-testid="ministry-save-draft"
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
