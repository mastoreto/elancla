"use client";

import { PLACE_ADDRESS_MAX_LENGTH, PLACE_NAME_MAX_LENGTH, type PlaceDto } from "@ancla/contracts";
import { useState } from "react";
import { toast } from "sonner";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { incompleteLocales } from "@/app/(dashboard)/calendar/schedule/utils/translatedText";
import { LocaleTabs } from "@/components/content/locale-tabs";
import { BoardButton } from "@/components/dashboard/board/board-button";
import {
  BoardFormFooter,
  BoardFormRow,
  BoardFormSection,
  BoardInput,
} from "@/components/dashboard/board/board-form";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import type { SiteLocales } from "../../types";
import {
  hasPlaceErrors,
  toPlaceFormValues,
  toUpdatePlaceBody,
  toUpsertPlaceBody,
  validatePlaceForm,
} from "../../utils/placeFormValues";

const placeFormCalendarPlacesPage = {
  container: cn("flex flex-col gap-3.5 rounded-[20px] bg-[var(--oro-50)] p-4"),
};

interface PlaceFormProps {
  /** `null` creates a new place. */
  place: PlaceDto | null;
  site: SiteLocales;
  /** Orders of the existing places: a new one goes after them. */
  existingOrders: readonly number[];
  onDone: () => void;
}

/** Create or edit one place: its name in every language, address, map link and order. */
export function PlaceForm({ place, site, existingOrders, onDone }: PlaceFormProps) {
  const { locales, defaultLocale } = site;
  const [values, setValues] = useState(() => toPlaceFormValues(place, locales, existingOrders));
  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [showErrors, setShowErrors] = useState(false);
  const { busy, run } = useCalendarRequest();
  const errors = validatePlaceForm(values, defaultLocale);

  async function submit(): Promise<void> {
    if (hasPlaceErrors(errors)) {
      setShowErrors(true);
      toast.error("Revisa los campos marcados.");
      const firstWithErrors = locales.find((locale) => errors.names[locale]);
      if (firstWithErrors) setActiveLocale(firstWithErrors);
      return;
    }
    const response = await run(
      () =>
        place
          ? calendarApiClient.content.calendar.places[":id"].$patch({
              param: { id: place.id },
              json: toUpdatePlaceBody(values, defaultLocale, place.version),
            })
          : calendarApiClient.content.calendar.places.$post({
              json: toUpsertPlaceBody(values, defaultLocale),
            }),
      place ? "Lugar actualizado" : "Lugar creado",
    );
    if (response) onDone();
  }

  return (
    <div className={placeFormCalendarPlacesPage.container} data-testid="place-form">
      <BoardFormSection>
        <LocaleTabs
          defaultLocale={defaultLocale}
          incompleteLocales={incompleteLocales(values.names, locales)}
          label="Idioma del lugar"
          locales={locales}
          onChange={setActiveLocale}
          value={activeLocale}
        />
        <BoardInput
          data-testid="place-name"
          error={showErrors ? errors.names[activeLocale] : undefined}
          id={`place-name-${activeLocale}`}
          label="Nombre"
          maxLength={PLACE_NAME_MAX_LENGTH}
          onChange={(event) =>
            setValues({ ...values, names: { ...values.names, [activeLocale]: event.target.value } })
          }
          value={values.names[activeLocale] ?? ""}
        />
        <BoardInput
          error={showErrors ? errors.address : undefined}
          hint="Opcional."
          id="place-address"
          label="Dirección"
          maxLength={PLACE_ADDRESS_MAX_LENGTH}
          onChange={(event) => setValues({ ...values, address: event.target.value })}
          value={values.address}
        />
        <BoardFormRow>
          <BoardInput
            error={showErrors ? errors.mapsUrl : undefined}
            hint="Opcional. Debe empezar con https://"
            id="place-maps-url"
            inputMode="url"
            label="Enlace del mapa"
            onChange={(event) => setValues({ ...values, mapsUrl: event.target.value })}
            value={values.mapsUrl}
          />
          <BoardInput
            error={showErrors ? errors.order : undefined}
            hint="Los números más bajos salen primero."
            id="place-order"
            inputMode="numeric"
            label="Orden"
            onChange={(event) => setValues({ ...values, order: event.target.value })}
            value={values.order}
          />
        </BoardFormRow>
      </BoardFormSection>
      <BoardFormFooter>
        <BoardButton disabled={busy} onClick={onDone} variant="ghost">
          Cancelar
        </BoardButton>
        <BoardButton
          data-testid="place-save"
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
