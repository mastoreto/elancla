export interface CopiableActivity {
  id: string;
  isFixed: boolean;
  year: number | null;
}

export interface CopiableEvent {
  id: string;
  year: number;
}

export interface CopySelection<
  Activity extends CopiableActivity,
  Event extends CopiableEvent,
> {
  activities: Activity[];
  events: Event[];
  /** Selected ids that are not something this year could copy: the request is refused. */
  rejectedIds: string[];
}

/**
 * Exactly what the wizard selected, nothing more. Only activities of a year (never the fixed ones,
 * which do not depend on it) and events of `fromYear` can be copied; any other id is reported
 * instead of being quietly dropped, so a stale or forged selection never copies something else.
 */
export function selectCopyItems<
  Activity extends CopiableActivity,
  Event extends CopiableEvent,
>(input: {
  fromYear: number;
  activityIds: readonly string[];
  eventIds: readonly string[];
  activities: readonly Activity[];
  events: readonly Event[];
}): CopySelection<Activity, Event> {
  const { fromYear } = input;
  const copiableActivities = input.activities.filter(
    (activity) => !activity.isFixed && activity.year === fromYear,
  );
  const copiableEvents = input.events.filter(
    (event) => event.year === fromYear,
  );
  const wantedActivities = new Set(input.activityIds);
  const wantedEvents = new Set(input.eventIds);
  const activities = copiableActivities.filter(({ id }) =>
    wantedActivities.has(id),
  );
  const events = copiableEvents.filter(({ id }) => wantedEvents.has(id));
  const found = new Set([...activities, ...events].map(({ id }) => id));
  const rejectedIds = [...wantedActivities, ...wantedEvents].filter(
    (id) => !found.has(id),
  );
  return { activities, events, rejectedIds };
}
