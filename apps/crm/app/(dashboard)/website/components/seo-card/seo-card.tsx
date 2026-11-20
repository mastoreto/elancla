"use client";

import { SEO_DESCRIPTION_MAX_LENGTH, type SiteSettingsDto } from "@ancla/contracts";
import { useState } from "react";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { BoardTextarea } from "@/components/dashboard/board/board-form";
import { cn } from "@/lib/utils";
import { useSaveSiteSettings } from "../../hooks/useSaveSiteSettings";
import { toNullableText } from "../../utils/toNullableText";
import { CardSaveFooter } from "../card-save-footer";

const seoCardWebsitePage = {
  body: cn("flex flex-col gap-3.5"),
  counter: cn("text-right text-xs text-[var(--tinta-apagada)]"),
  counterOver: cn("font-semibold text-primary"),
};

type SeoSettings = Pick<SiteSettingsDto, "translations" | "locales" | "defaultLocale" | "version">;

interface SeoCardProps {
  settings: SeoSettings;
}

export function SeoCard({ settings }: SeoCardProps) {
  const { locales, defaultLocale } = settings;
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      locales.map((locale) => [locale, settings.translations[locale]?.seoDescription ?? ""]),
    ),
  );
  const { canEdit, saving, save } = useSaveSiteSettings(settings.version);

  const incompleteLocales = locales.filter((locale) => (texts[locale] ?? "").trim() === "");
  const activeText = texts[activeLocale] ?? "";
  const isOver = activeText.length > SEO_DESCRIPTION_MAX_LENGTH;
  const hasInvalid = locales.some(
    (locale) => (texts[locale] ?? "").length > SEO_DESCRIPTION_MAX_LENGTH,
  );
  const defaultMissing = incompleteLocales.includes(defaultLocale);

  const submit = () =>
    save(
      {
        translations: Object.fromEntries(
          locales.map((locale) => [
            locale,
            { seoDescription: toNullableText(texts[locale] ?? "") },
          ]),
        ),
      },
      "SEO actualizado",
    );

  return (
    <BoardCard>
      <BoardCardHeader
        subtitle="Texto que muestran los buscadores cuando una página no tiene el suyo"
        title="SEO por defecto"
      />
      <div className={seoCardWebsitePage.body}>
        <LocaleTabs
          defaultLocale={defaultLocale}
          incompleteLocales={incompleteLocales}
          locales={locales}
          onChange={setActiveLocale}
          value={activeLocale}
        />
        <BoardTextarea
          disabled={!canEdit}
          id="site-seo-description"
          label="Descripción"
          onChange={(event) =>
            setTexts((previous) => ({ ...previous, [activeLocale]: event.target.value }))
          }
          rows={3}
          value={activeText}
        />
        <span
          aria-live="polite"
          className={cn(seoCardWebsitePage.counter, isOver && seoCardWebsitePage.counterOver)}
        >
          {activeText.length}/{SEO_DESCRIPTION_MAX_LENGTH}
        </span>
      </div>
      <CardSaveFooter
        canEdit={canEdit}
        disabled={hasInvalid || defaultMissing}
        onSave={() => void submit()}
        saving={saving}
      />
    </BoardCard>
  );
}
