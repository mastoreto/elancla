"use client";

import { ACTIVITY_TITLE_MAX_LENGTH, SERVICE_KINDS } from "@ancla/contracts";
import { LocaleTabs } from "@/components/content/locale-tabs";
import {
  BoardFormRow,
  BoardFormSection,
  BoardInput,
  BoardSelect,
  BoardSwitchRow,
} from "@/components/dashboard/board/board-form";
import type {
  ActivityFormErrors,
  ActivityFormValues,
  ActivityScope,
  MinistryOption,
  PlaceOption,
  ServiceKindChoice,
  SiteLocales,
} from "../../types";
import { toggleMinistry } from "../../utils/activityFormValues";
import { incompleteLocales } from "../../utils/translatedText";
import { WEEKDAY_LABELS } from "../../utils/weekdays";
import { MinistryPicker } from "../ministry-picker";

/** A select cannot hold an empty value, so "no place" travels as this one. */
const NO_PLACE = "none";

const WEEKDAY_OPTIONS = WEEKDAY_LABELS.map((label, weekday) => ({
  value: String(weekday),
  label,
}));
const KIND_LABELS = {
  none: "Ninguno",
  worship: "Culto",
  bibleSchool: "Escuela bíblica",
} satisfies Record<ServiceKindChoice, string>;
const KIND_OPTIONS = (["none", ...SERVICE_KINDS] as const).map((value) => ({
  value,
  label: KIND_LABELS[value],
}));
const SCOPE_OPTIONS = [
  { value: "fixed", label: "Fija: se repite todos los años" },
  { value: "year", label: "De un año" },
] satisfies { value: ActivityScope; label: string }[];

interface ActivityFormFieldsProps {
  values: ActivityFormValues;
  errors: ActivityFormErrors;
  showErrors: boolean;
  site: SiteLocales;
  places: readonly PlaceOption[];
  ministries: readonly MinistryOption[];
  activeLocale: string;
  onActiveLocaleChange: (locale: string) => void;
  onChange: (patch: Partial<ActivityFormValues>) => void;
}

/** The inputs of the activity form; the parent owns the state and the request. */
export function ActivityFormFields({
  values,
  errors,
  showErrors,
  site,
  places,
  ministries,
  activeLocale,
  onActiveLocaleChange,
  onChange,
}: ActivityFormFieldsProps) {
  const placeOptions = [
    { value: NO_PLACE, label: "Sin lugar" },
    ...places.map((place) => ({ value: place.id, label: place.name })),
  ];
  const shown = (error: string | undefined) => (showErrors ? error : undefined);

  return (
    <BoardFormSection>
      <LocaleTabs
        defaultLocale={site.defaultLocale}
        incompleteLocales={incompleteLocales(values.titles, site.locales)}
        label="Idioma de la actividad"
        locales={site.locales}
        onChange={onActiveLocaleChange}
        value={activeLocale}
      />
      <BoardInput
        data-testid="activity-title"
        error={shown(errors.titles[activeLocale])}
        id={`activity-title-${activeLocale}`}
        label="Título"
        maxLength={ACTIVITY_TITLE_MAX_LENGTH}
        onChange={(event) =>
          onChange({ titles: { ...values.titles, [activeLocale]: event.target.value } })
        }
        value={values.titles[activeLocale] ?? ""}
      />
      <BoardFormRow columns={3}>
        <BoardSelect
          id="activity-weekday"
          label="Día"
          onValueChange={(weekday) => onChange({ weekday })}
          options={WEEKDAY_OPTIONS}
          value={values.weekday}
        />
        <BoardInput
          error={shown(errors.start)}
          id="activity-start"
          label="Hora de inicio"
          onChange={(event) => onChange({ start: event.target.value })}
          type="time"
          value={values.start}
        />
        <BoardInput
          error={shown(errors.end)}
          hint="Opcional."
          id="activity-end"
          label="Hora de fin"
          onChange={(event) => onChange({ end: event.target.value })}
          type="time"
          value={values.end}
        />
      </BoardFormRow>
      <BoardFormRow>
        <BoardSelect
          id="activity-place"
          label="Lugar"
          onValueChange={(placeId) => onChange({ placeId: placeId === NO_PLACE ? "" : placeId })}
          options={placeOptions}
          value={values.placeId === "" ? NO_PLACE : values.placeId}
        />
        <BoardSelect
          hint="Un culto o la escuela bíblica alimentan los horarios de culto del sitio."
          id="activity-kind"
          label="Es horario de"
          onValueChange={(serviceKind) =>
            onChange({ serviceKind: serviceKind as ServiceKindChoice })
          }
          options={KIND_OPTIONS}
          value={values.serviceKind}
        />
      </BoardFormRow>
      <BoardFormRow>
        <BoardSelect
          id="activity-scope"
          label="Alcance"
          onValueChange={(scope) => onChange({ scope: scope as ActivityScope })}
          options={SCOPE_OPTIONS}
          value={values.scope}
        />
        {values.scope === "year" ? (
          <BoardInput
            error={shown(errors.year)}
            id="activity-year"
            inputMode="numeric"
            label="Año"
            onChange={(event) => onChange({ year: event.target.value })}
            value={values.year}
          />
        ) : null}
      </BoardFormRow>
      <BoardSwitchRow
        checked={values.isPublic}
        hint="Las internas solo se ven en el CRM."
        onCheckedChange={(isPublic) => onChange({ isPublic })}
        title="Pública"
      />
      {values.scope === "fixed" ? (
        <BoardSwitchRow
          checked={values.annualReview}
          hint="Alguien debe confirmarla cada año antes de publicar el calendario."
          onCheckedChange={(annualReview) => onChange({ annualReview })}
          title="Revisión anual"
        />
      ) : null}
      <MinistryPicker
        error={shown(errors.ministryIds)}
        ministries={ministries}
        onToggle={(ministryId) =>
          onChange({ ministryIds: toggleMinistry(values.ministryIds, ministryId) })
        }
        selectedIds={values.ministryIds}
      />
    </BoardFormSection>
  );
}
