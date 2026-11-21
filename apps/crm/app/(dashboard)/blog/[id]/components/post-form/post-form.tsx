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
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { useSavePostDraft } from "../../hooks/useSavePostDraft";
import type {
  PostFormOptions,
  PostFormValues,
  PostTranslationValues,
  SiteLocales,
} from "../../types";
import { toPostFormValues, toPostSnapshot } from "../../utils/postFormValues";
import { hasPostFormErrors, validatePostForm } from "../../utils/validatePostForm";
import { PostDetailsCard } from "../post-details-card";
import { PostTranslationFields } from "../post-translation-fields";

const postFormBlogPage = {
  container: cn("flex flex-col gap-[18px]"),
};

const NO_ERRORS = { translations: {}, general: {} };

/** The languages the live revision already published: their slugs are part of the URL. */
function publishedLocalesOf(status: EditorialStatusDto): string[] {
  const translations = status.live?.snapshot.translations;
  return typeof translations === "object" && translations !== null ? Object.keys(translations) : [];
}

interface PostFormProps {
  postId: string;
  status: EditorialStatusDto;
  site: SiteLocales;
  options: PostFormOptions;
}

export function PostForm({ postId, status, site, options }: PostFormProps) {
  const { locales, defaultLocale } = site;
  const access = useAccess();
  const canEdit = can(access, PERMISSIONS.blogPosts.edit);
  // With no draft in progress the next one starts from what is published.
  const [values, setValues] = useState<PostFormValues>(() =>
    toPostFormValues((status.working ?? status.live)?.snapshot ?? null, locales),
  );
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, save } = useSavePostDraft(postId);
  const publishedLocales = publishedLocalesOf(status);

  const errors = validatePostForm(values, defaultLocale);
  const activeValues = values.translations[activeLocale];
  const sentLocales = Object.keys(
    toPostSnapshot(values, defaultLocale).translations as Record<string, unknown>,
  );
  const incompleteLocales = locales.filter((locale) => !sentLocales.includes(locale));

  const updateDetails = (patch: Partial<PostFormValues>) =>
    setValues((previous) => ({ ...previous, ...patch }));

  const updateTranslation = (locale: string, patch: Partial<PostTranslationValues>) =>
    setValues((previous) => {
      const current = previous.translations[locale];
      if (!current) return previous;
      return {
        ...previous,
        translations: { ...previous.translations, [locale]: { ...current, ...patch } },
      };
    });

  // The slug follows the title until the user types one by hand.
  const updateTitle = (locale: string, title: string) =>
    setValues((previous) => {
      const current = previous.translations[locale];
      if (!current) return previous;
      const slug = current.slugEdited ? current.slug : slugify(title);
      return {
        ...previous,
        translations: { ...previous.translations, [locale]: { ...current, title, slug } },
      };
    });

  async function submit(): Promise<void> {
    if (hasPostFormErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.translations[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    await save(toPostSnapshot(values, defaultLocale));
  }

  return (
    <div className={postFormBlogPage.container}>
      <EditorialStatusBar
        contentType="blog-post"
        entityId={postId}
        getSnapshot={() => toPostSnapshot(values, defaultLocale)}
        showSaveDraft={false}
        status={status}
      />
      <BoardFormCard
        subtitle="El título, la dirección, el contenido y el SEO del artículo en cada idioma."
        title="Contenido del artículo"
      >
        <BoardFormSections>
          <LocaleTabs
            defaultLocale={defaultLocale}
            incompleteLocales={incompleteLocales}
            label="Idioma del artículo"
            locales={locales}
            onChange={setActiveLocale}
            value={activeLocale}
          />
          {activeValues ? (
            <PostTranslationFields
              disabled={!canEdit}
              errors={showErrors ? (errors.translations[activeLocale] ?? {}) : {}}
              key={activeLocale}
              locale={activeLocale}
              onChange={(patch) => updateTranslation(activeLocale, patch)}
              onTitleChange={(title) => updateTitle(activeLocale, title)}
              slugLocked={publishedLocales.includes(activeLocale)}
              values={activeValues}
            />
          ) : null}
        </BoardFormSections>
      </BoardFormCard>
      <PostDetailsCard
        disabled={!canEdit}
        errors={showErrors ? errors.general : NO_ERRORS.general}
        onChange={updateDetails}
        options={options}
        site={site}
        values={values}
      />
      <BoardFormFooter>
        <BoardButton href={getChurchRoutePath("blog")} variant="ghost">
          Volver
        </BoardButton>
        {canEdit ? (
          <BoardButton
            data-testid="post-save-draft"
            disabled={busy}
            onClick={() => void submit()}
            variant="primary"
          >
            {busy ? "Guardando…" : "Guardar borrador"}
          </BoardButton>
        ) : null}
      </BoardFormFooter>
    </div>
  );
}
