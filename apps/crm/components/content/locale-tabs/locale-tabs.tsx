"use client";

import { cn } from "@/lib/utils";

const LOCALE_NAMES: Record<string, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

const localeTabsContentPage = {
  list: cn("flex w-full flex-wrap gap-1.5 border-b border-border"),
  tab: cn(
    "-mb-px inline-flex items-center gap-2 border-b-[3px] border-transparent px-1 py-2.5 mr-3.5 text-sm font-medium",
    "text-[var(--tinta-apagada)] transition-colors hover:text-foreground",
  ),
  tabActive: cn("border-[var(--oro)] font-bold text-foreground"),
  required: cn("text-[11px] font-semibold text-[var(--tinta-suave)]"),
  missing: cn("size-2 rounded-full bg-[var(--oro)]"),
  srOnly: cn("sr-only"),
};

interface LocaleTabsProps {
  /** Languages the organization works in. */
  locales: readonly string[];
  /** The language that must always be filled in (the others fall back to it). */
  defaultLocale: string;
  value: string;
  onChange: (locale: string) => void;
  /** Locales whose translation is still missing: they get a marker. */
  incompleteLocales?: readonly string[];
  label?: string;
  className?: string;
}

/** One tab per language; the default one is flagged as required and gaps are flagged with a dot. */
export function LocaleTabs({
  locales,
  defaultLocale,
  value,
  onChange,
  incompleteLocales = [],
  label = "Idioma",
  className,
}: LocaleTabsProps) {
  return (
    <div aria-label={label} className={cn(localeTabsContentPage.list, className)} role="tablist">
      {locales.map((locale) => {
        const isActive = locale === value;
        const isMissing = incompleteLocales.includes(locale);
        return (
          <button
            aria-selected={isActive}
            className={cn(localeTabsContentPage.tab, isActive && localeTabsContentPage.tabActive)}
            key={locale}
            onClick={() => onChange(locale)}
            role="tab"
            type="button"
          >
            {LOCALE_NAMES[locale] ?? locale.toUpperCase()}
            {locale === defaultLocale ? (
              <span className={localeTabsContentPage.required}>obligatorio</span>
            ) : null}
            {isMissing ? (
              <>
                <span aria-hidden="true" className={localeTabsContentPage.missing} />
                <span className={localeTabsContentPage.srOnly}>falta la traducción</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
