import { VISIT_DIRECTION_MAX_LENGTH } from "@ancla/contracts";
import { LocalizedTextField } from "@/components/content/localized-text-field";
import { cn } from "@/lib/utils";
import type { DirectionKey, SiteLocales, VisitFormErrors, VisitFormValues } from "../../types";

const directionsSectionWebsitePage = {
  container: cn("flex flex-col gap-5"),
  heading: cn("flex flex-col gap-[3px]"),
  title: cn("font-display text-[17px] font-medium"),
  hint: cn("text-[13px] text-[var(--tinta-apagada)]"),
};

const DIRECTION_FIELDS: readonly { key: DirectionKey; label: string }[] = [
  { key: "parking", label: "Estacionamiento" },
  { key: "transit", label: "Transporte público" },
  { key: "accessibility", label: "Accesibilidad" },
];

interface DirectionsSectionProps extends SiteLocales {
  directions: VisitFormValues["directions"];
  errors: VisitFormErrors["directions"];
  disabled: boolean;
  onChange: (key: DirectionKey, locale: string, value: string) => void;
}

export function DirectionsSection({
  directions,
  errors,
  disabled,
  onChange,
  locales,
  defaultLocale,
}: DirectionsSectionProps) {
  return (
    <div className={directionsSectionWebsitePage.container}>
      <div className={directionsSectionWebsitePage.heading}>
        <h3 className={directionsSectionWebsitePage.title}>Indicaciones</h3>
        <span className={directionsSectionWebsitePage.hint}>
          Cómo llegar y qué esperar. Los bloques vacíos no se muestran en el sitio.
        </span>
      </div>
      {DIRECTION_FIELDS.map(({ key, label }) => (
        <LocalizedTextField
          defaultLocale={defaultLocale}
          disabled={disabled}
          error={errors[key]}
          id={`visit-${key}`}
          key={key}
          label={label}
          locales={locales}
          maxLength={VISIT_DIRECTION_MAX_LENGTH}
          multiline={true}
          onChange={(locale, value) => onChange(key, locale, value)}
          tabsLabel={`Idioma: ${label}`}
          values={directions[key]}
        />
      ))}
    </div>
  );
}
