import { BoardButton } from "@/components/dashboard/board/board-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import type { SchedulePageData } from "../../types";
import { pickTranslated } from "../../utils/translatedText";
import { ActivitiesSection } from "../activities-section";
import { ExceptionsSection } from "../exceptions-section";
import { ScheduleSetsSection } from "../schedule-sets-section";

const schedulePageContentSchedulePage = {
  container: cn("flex flex-col gap-5"),
  links: cn("flex flex-wrap justify-end gap-2"),
};

const UNNAMED_SET = "Sin nombre";

/** The schedule screen: the sets, the activities of the selected one and the exceptions. */
export function SchedulePageContent({
  sets,
  selectedSetId,
  activities,
  exceptions,
  site,
  places,
  ministries,
  review,
  canEdit,
}: SchedulePageData) {
  const setOptions = sets.map((set) => ({
    id: set.id,
    name: pickTranslated(
      set.translations,
      (translation) => translation.name,
      site.defaultLocale,
      UNNAMED_SET,
    ),
  }));
  const selected = setOptions.find((set) => set.id === selectedSetId) ?? null;

  return (
    <div className={schedulePageContentSchedulePage.container}>
      <div className={schedulePageContentSchedulePage.links}>
        <BoardButton href={getChurchRoutePath("calendar")} variant="ghost">
          Volver al calendario
        </BoardButton>
        <BoardButton href={getChurchRoutePath("calendar", "places")} variant="outline">
          Lugares
        </BoardButton>
        {canEdit ? (
          <BoardButton href={getChurchRoutePath("calendar", "copy")} variant="outline">
            Copiar del año anterior
          </BoardButton>
        ) : null}
      </div>
      <ScheduleSetsSection
        canEdit={canEdit}
        selectedSetId={selectedSetId}
        sets={sets}
        site={site}
      />
      {selected ? (
        <ActivitiesSection
          activities={activities}
          canEdit={canEdit}
          ministries={ministries}
          places={places}
          review={review}
          scheduleSet={selected}
          site={site}
        />
      ) : null}
      <ExceptionsSection canEdit={canEdit} exceptions={exceptions} sets={setOptions} site={site} />
    </div>
  );
}
