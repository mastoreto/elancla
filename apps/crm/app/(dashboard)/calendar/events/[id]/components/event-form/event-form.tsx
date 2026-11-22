"use client";

import {
  type EditorialStatusDto,
  EVENT_LINK_URL_MAX_LENGTH,
  EVENT_STATUSES,
  type EventStatus,
  PERMISSIONS,
} from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { MinistryImageField } from "@/app/(dashboard)/ministries/components/ministry-image-field";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormCard,
  BoardFormDivider,
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardFormSections,
  BoardInput,
  BoardSelect,
} from "@/components/dashboard/board/board-form";
import { EditorialStatusBar } from "@/components/editorial/editorial-status-bar";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { useSaveEventDraft } from "../../hooks/useSaveEventDraft";
import type {
  EventFormValues,
  EventOption,
  EventTranslationValues,
  SiteLocales,
} from "../../types";
import { toEventFormValues, toEventSnapshot } from "../../utils/eventFormValues";
import { hasEventFormErrors, validateEventForm } from "../../utils/validateEventForm";
import { EventMinistriesField } from "../event-ministries-field";
import { EventPlaceFields } from "../event-place-fields";
import { EventTranslationFields } from "../event-translation-fields";
import { EventWhenFields } from "../event-when-fields";

const STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: "Programado",
  cancelled: "Cancelado",
};

const STATUS_OPTIONS = EVENT_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

const eventFormCalendarPage = {
  container: cn("flex flex-col gap-[18px]"),
};

interface EventFormProps {
  eventId: string;
  year: number;
  /** The editorial status, already trimmed to what the year allows. */
  status: EditorialStatusDto;
  site: SiteLocales;
  ministries: readonly EventOption[];
  places: readonly EventOption[];
}

/** The content of an event: status bar, text by language, when, where, ministries, image, link. */
export function EventForm({ eventId, year, status, site, ministries, places }: EventFormProps) {
  const { locales, defaultLocale } = site;
  const access = useAccess();
  const canEdit = can(access, PERMISSIONS.events.edit);
  // With no draft in progress the next one starts from what is published.
  const [values, setValues] = useState<EventFormValues>(() =>
    toEventFormValues((status.working ?? status.live)?.snapshot ?? null, locales),
  );
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, save } = useSaveEventDraft(eventId);

  const errors = validateEventForm(values, { defaultLocale, year });
  const activeValues = values.translations[activeLocale];
  const sentLocales = Object.keys(
    toEventSnapshot(values, defaultLocale).translations as Record<string, unknown>,
  );
  const incompleteLocales = locales.filter((locale) => !sentLocales.includes(locale));
  const update = (patch: Partial<EventFormValues>) =>
    setValues((previous) => ({ ...previous, ...patch }));

  const updateTranslation = (locale: string, patch: Partial<EventTranslationValues>) =>
    setValues((previous) => {
      const current = previous.translations[locale];
      if (!current) return previous;
      return {
        ...previous,
        translations: { ...previous.translations, [locale]: { ...current, ...patch } },
      };
    });

  async function submit(): Promise<void> {
    if (hasEventFormErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.translations[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    await save(toEventSnapshot(values, defaultLocale));
  }

  return (
    <div className={eventFormCalendarPage.container}>
      <EditorialStatusBar
        contentType="event"
        entityId={eventId}
        getSnapshot={() => toEventSnapshot(values, defaultLocale)}
        showSaveDraft={false}
        status={status}
      />
      <BoardFormCard
        subtitle="Qué es, cuándo y dónde ocurre. El título y la descripción van en cada idioma."
        title="Evento"
      >
        <BoardFormSections>
          <LocaleTabs
            defaultLocale={defaultLocale}
            incompleteLocales={incompleteLocales}
            label="Idioma del evento"
            locales={locales}
            onChange={setActiveLocale}
            value={activeLocale}
          />
          {activeValues ? (
            <EventTranslationFields
              disabled={!canEdit}
              errors={showErrors ? (errors.translations[activeLocale] ?? {}) : {}}
              key={activeLocale}
              locale={activeLocale}
              onChange={(patch) => updateTranslation(activeLocale, patch)}
              values={activeValues}
            />
          ) : null}
          <BoardFormDivider />
          <EventWhenFields
            disabled={!canEdit}
            errors={showErrors ? errors.general : {}}
            onChange={update}
            values={values}
          />
          <BoardFormDivider />
          <EventPlaceFields
            disabled={!canEdit}
            errors={showErrors ? errors.general : {}}
            onChange={update}
            places={places}
            values={values}
          />
          <BoardFormDivider />
          <BoardFormSection>
            <EventMinistriesField
              disabled={!canEdit}
              error={showErrors ? errors.general.ministryIds : undefined}
              ministries={ministries}
              onChange={(ministryIds) => update({ ministryIds })}
              selectedIds={values.ministryIds}
            />
            <MinistryImageField
              disabled={!canEdit}
              error={showErrors ? errors.general.imageId : undefined}
              hint="JPG, PNG, WebP o AVIF"
              id="event-image"
              label="Imagen"
              mediaId={values.imageId}
              onChange={(imageId) => update({ imageId })}
              title="Arrastra la imagen del evento"
            />
            <BoardFormRow>
              <BoardInput
                data-testid="event-link-url"
                disabled={!canEdit}
                error={showErrors ? errors.general.linkUrl : undefined}
                hint="Opcional: inscripción o más información."
                id="event-link-url"
                label="Enlace"
                maxLength={EVENT_LINK_URL_MAX_LENGTH}
                onChange={(event) => update({ linkUrl: event.target.value })}
                placeholder="https://"
                value={values.linkUrl}
              />
              <BoardSelect
                disabled={!canEdit}
                hint="Un evento cancelado sigue visible, marcado como cancelado."
                id="event-status"
                label="Estado"
                onValueChange={(next) => update({ status: next as EventStatus })}
                options={STATUS_OPTIONS}
                value={values.status}
              />
            </BoardFormRow>
          </BoardFormSection>
        </BoardFormSections>
        <BoardFormFooter>
          <BoardButton href={getChurchRoutePath("calendar")} variant="ghost">
            Volver
          </BoardButton>
          {canEdit ? (
            <BoardButton
              data-testid="event-save-draft"
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
