"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { pickTranslated } from "@/app/(dashboard)/calendar/schedule/utils/translatedText";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { PlacesData } from "../../types";
import { PlaceForm } from "../place-form";
import { PlaceRow } from "../place-row";

const placesPageContentCalendarPlacesPage = {
  list: cn("flex flex-col gap-1"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  actions: cn("flex gap-2"),
  icon: cn("size-4"),
};

const NEW_PLACE = "new";
const UNNAMED_PLACE = "Sin nombre";

/** The places of the calendar, with creation, editing and deletion. */
export function PlacesPageContent({ places, site, canEdit }: PlacesData) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useCalendarRequest();
  const finish = () => setEditing(null);
  const orders = places.map((place) => place.order);

  return (
    <BoardCard data-testid="calendar-places-card">
      <BoardCardHeader
        action={
          <div className={placesPageContentCalendarPlacesPage.actions}>
            <BoardButton href={getChurchRoutePath("calendar")} variant="ghost">
              Volver
            </BoardButton>
            {canEdit && editing === null ? (
              <BoardButton
                data-testid="place-new"
                onClick={() => setEditing(NEW_PLACE)}
                variant="primary"
              >
                <Plus aria-hidden="true" className={placesPageContentCalendarPlacesPage.icon} />
                Nuevo lugar
              </BoardButton>
            ) : null}
          </div>
        }
        subtitle="Donde ocurren las actividades y los eventos. Un lugar que alguno usa no se puede borrar."
        title="Lugares"
      />
      {editing === NEW_PLACE ? (
        <PlaceForm existingOrders={orders} onDone={finish} place={null} site={site} />
      ) : null}
      {places.length === 0 && editing === null ? (
        <p className={placesPageContentCalendarPlacesPage.empty}>Todavía no hay lugares.</p>
      ) : (
        <div className={placesPageContentCalendarPlacesPage.list}>
          {places.map((place) =>
            editing === place.id ? (
              <PlaceForm
                existingOrders={orders}
                key={place.id}
                onDone={finish}
                place={place}
                site={site}
              />
            ) : (
              <PlaceRow
                address={place.address}
                canEdit={canEdit}
                disabled={busy}
                key={place.id}
                mapsUrl={place.mapsUrl}
                name={pickTranslated(
                  place.translations,
                  (translation) => translation.name,
                  site.defaultLocale,
                  UNNAMED_PLACE,
                )}
                onDelete={() =>
                  void run(
                    () =>
                      calendarApiClient.content.calendar.places[":id"].$delete({
                        param: { id: place.id },
                      }),
                    "Lugar eliminado",
                  )
                }
                onEdit={() => setEditing(place.id)}
                testId={`calendar-place-row-${place.id}`}
              />
            ),
          )}
        </div>
      )}
    </BoardCard>
  );
}
