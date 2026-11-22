"use client";

import type { RecurringActivityDto } from "@ancla/contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCalendarRequest } from "@/app/(dashboard)/calendar/hooks/useCalendarRequest";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardCard, BoardCardHeader } from "@/components/dashboard/board/board-card";
import { calendarApiClient } from "@/lib/api/calendarApiClient";
import { cn } from "@/lib/utils";
import type { ActivitiesSectionData } from "../../types";
import { describeActivityBadges } from "../../utils/activityBadges";
import { pickTranslated } from "../../utils/translatedText";
import { describeTimeRange, groupByWeekday } from "../../utils/weekdays";
import { ActivityForm } from "../activity-form";
import { ActivityRow } from "../activity-row";

const activitiesSectionSchedulePage = {
  day: cn("flex flex-col gap-1"),
  dayTitle: cn("px-3 pt-3 text-[13px] font-bold tracking-wide text-[var(--tinta-suave)] uppercase"),
  empty: cn("py-6 text-center text-sm text-[var(--tinta-apagada)]"),
  icon: cn("size-4"),
};

const NEW_ACTIVITY = "new";
const UNTITLED_ACTIVITY = "Sin título";

/** The weekly activities of the selected schedule set, by day, with their forms. */
export function ActivitiesSection({
  scheduleSet,
  activities,
  site,
  places,
  ministries,
  review,
  canEdit,
}: ActivitiesSectionData) {
  const [editing, setEditing] = useState<string | null>(null);
  const { busy, run } = useCalendarRequest();
  const finish = () => setEditing(null);
  const placeNames = new Map(places.map((place) => [place.id, place.name]));
  const ministryById = new Map(ministries.map((ministry) => [ministry.id, ministry]));

  function reviewActionOf(activity: RecurringActivityDto) {
    if (!(activity.isFixed && activity.annualReview)) return null;
    return {
      year: review.year,
      available: review.yearExists,
      onConfirm: () =>
        void run(
          () =>
            calendarApiClient.content.calendar.years[":year"].reviews.$post({
              param: { year: String(review.year) },
              json: { activityId: activity.id },
            }),
          `Revisión del ${review.year} confirmada`,
        ),
    };
  }

  return (
    <BoardCard data-testid="schedule-activities-card">
      <BoardCardHeader
        action={
          canEdit && editing === null ? (
            <BoardButton
              data-testid="activity-new"
              onClick={() => setEditing(NEW_ACTIVITY)}
              variant="primary"
            >
              <Plus aria-hidden="true" className={activitiesSectionSchedulePage.icon} />
              Nueva actividad
            </BoardButton>
          ) : null
        }
        subtitle="Las que tienen tipo «Culto» o «Escuela bíblica» son los horarios de culto del sitio."
        title={`Actividades de ${scheduleSet.name}`}
      />
      {editing === NEW_ACTIVITY ? (
        <ActivityForm
          activity={null}
          ministries={ministries}
          onDone={finish}
          places={places}
          scheduleSetId={scheduleSet.id}
          site={site}
        />
      ) : null}
      {activities.length === 0 && editing === null ? (
        <p className={activitiesSectionSchedulePage.empty}>
          Este horario todavía no tiene actividades.
        </p>
      ) : null}
      {groupByWeekday(activities).map((group) => (
        <div className={activitiesSectionSchedulePage.day} key={group.weekday}>
          <h3 className={activitiesSectionSchedulePage.dayTitle}>{group.label}</h3>
          {group.activities.map((activity) =>
            editing === activity.id ? (
              <ActivityForm
                activity={activity}
                key={activity.id}
                ministries={ministries}
                onDone={finish}
                places={places}
                scheduleSetId={scheduleSet.id}
                site={site}
              />
            ) : (
              <ActivityRow
                badges={describeActivityBadges(activity)}
                canEdit={canEdit}
                disabled={busy}
                key={activity.id}
                ministries={activity.ministryIds.flatMap((id) => ministryById.get(id) ?? [])}
                onDelete={() =>
                  void run(
                    () =>
                      calendarApiClient.content.calendar.activities[":id"].$delete({
                        param: { id: activity.id },
                      }),
                    "Actividad eliminada",
                  )
                }
                onEdit={() => setEditing(activity.id)}
                placeName={activity.placeId ? (placeNames.get(activity.placeId) ?? null) : null}
                review={reviewActionOf(activity)}
                testId={`schedule-activity-row-${activity.id}`}
                timeRange={describeTimeRange(activity.start, activity.end)}
                title={pickTranslated(
                  activity.translations,
                  (translation) => translation.title,
                  site.defaultLocale,
                  UNTITLED_ACTIVITY,
                )}
              />
            ),
          )}
        </div>
      ))}
    </BoardCard>
  );
}
