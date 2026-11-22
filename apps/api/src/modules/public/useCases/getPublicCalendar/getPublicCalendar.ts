import {
  DEFAULT_MINISTRY_COLOR,
  type EventSnapshot,
  type MinistryColor,
  ministryColor,
  type PublicBlogImageDto,
  type PublicCalendarDto,
  type PublicCalendarEventDto,
  type PublicCalendarExceptionDto,
  type PublicCalendarMinistryDto,
  type PublicCalendarPlaceDto,
  type PublicCalendarWeeklyDto,
} from "@ancla/contracts";
import { NotFoundError } from "../../../../core/errors";
import {
  formatDateOnly,
  loadPublicCalendar,
  type PublicCalendarData,
  toServiceKindDto,
} from "../../../calendar";
import { listLiveSnapshots } from "../../../editorial";
import { findOrganizationLocales, findPublicMinistries } from "../../data";
import {
  pickLocalizedValue,
  pickMinistryTranslation,
  resolvePublicLocale,
  type ServedLocales,
} from "../../domain";
import { loadBlogImages } from "../loadBlogCorpus";

/** A ministry as the calendar names it: its public name and slug, and the color of its row. */
interface CalendarMinistry {
  name: string | null;
  slug?: string;
  color: MinistryColor;
}

type MinistryIndex = ReadonlyMap<string, CalendarMinistry>;

async function indexMinistries(
  organizationId: string,
  served: ServedLocales,
): Promise<MinistryIndex> {
  const [live, rows] = await Promise.all([
    listLiveSnapshots(organizationId, "MINISTRY"),
    findPublicMinistries(organizationId),
  ]);
  const snapshots = new Map(live.map((item) => [item.entityId, item.snapshot]));
  return new Map(
    rows.map((row) => {
      const snapshot = snapshots.get(row.id);
      const picked = snapshot
        ? pickMinistryTranslation(snapshot, served)
        : null;
      const entry: CalendarMinistry = {
        name: picked?.translation.name ?? null,
        ...(picked && row.destination === "PAGE"
          ? { slug: picked.translation.slug }
          : {}),
        color: ministryColor.catch(DEFAULT_MINISTRY_COLOR).parse(row.color),
      };
      return [row.id, entry];
    }),
  );
}

/** Public names of the ministries (those without a published profile are not named) and the color of the first. */
function describeMinistries(
  ids: readonly string[],
  index: MinistryIndex,
): { names: string[]; color: MinistryColor } {
  const entries = ids.flatMap((id) => {
    const entry = index.get(id);
    return entry ? [entry] : [];
  });
  return {
    names: entries.flatMap(({ name }) => (name ? [name] : [])),
    color: entries[0]?.color ?? DEFAULT_MINISTRY_COLOR,
  };
}

function placeOf(
  placeId: string | null | undefined,
  data: PublicCalendarData,
  served: ServedLocales,
): PublicCalendarPlaceDto | undefined {
  const place = data.places.find((candidate) => candidate.id === placeId);
  if (!place) return undefined;
  const name = pickLocalizedValue(place.translations, served, (t) => t.name);
  if (name === null) return undefined;
  return { name, ...(place.address ? { address: place.address } : {}) };
}

function toWeekly(
  data: PublicCalendarData,
  index: MinistryIndex,
  served: ServedLocales,
): PublicCalendarWeeklyDto[] {
  return data.weekly
    .flatMap(({ weekday, activity }): PublicCalendarWeeklyDto[] => {
      const title = pickLocalizedValue(
        activity.translations,
        served,
        (t) => t.title,
      );
      if (title === null) return [];
      const { names, color } = describeMinistries(
        activity.ministries.map(({ ministryId }) => ministryId),
        index,
      );
      const place = placeOf(activity.placeId, data, served);
      const serviceKind = toServiceKindDto(activity.serviceKind);
      return [
        {
          weekday,
          start: activity.start,
          ...(activity.end ? { end: activity.end } : {}),
          title,
          ...(place ? { place } : {}),
          ministries: names,
          color,
          ...(serviceKind ? { serviceKind } : {}),
        },
      ];
    })
    .sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start));
}

function toExceptions(
  data: PublicCalendarData,
  served: ServedLocales,
): PublicCalendarExceptionDto[] {
  return data.exceptions.map((exception) => ({
    date: formatDateOnly(exception.date),
    message:
      pickLocalizedValue(exception.translations, served, (t) => t.message) ??
      "",
    noMeeting: exception.replacementSetId === null,
  }));
}

function eventPlaceOf(
  snapshot: EventSnapshot,
  data: PublicCalendarData,
  served: ServedLocales,
): PublicCalendarEventDto["place"] {
  if (snapshot.placeMode === "tbc") return "tbc";
  if (snapshot.placeMode === "external") {
    return snapshot.externalAddress
      ? { name: snapshot.externalAddress }
      : undefined;
  }
  return placeOf(snapshot.placeId, data, served);
}

const byStart = (a: PublicCalendarEventDto, b: PublicCalendarEventDto) =>
  a.startDate.localeCompare(b.startDate) ||
  (a.startTime ?? "").localeCompare(b.startTime ?? "");

async function toEvents(
  organizationId: string,
  data: PublicCalendarData,
  index: MinistryIndex,
  served: ServedLocales,
): Promise<PublicCalendarEventDto[]> {
  if (data.events.length === 0) return [];
  const live = await listLiveSnapshots(organizationId, "EVENT");
  const snapshots = new Map(
    live.map((item) => [
      item.entityId,
      item.snapshot as unknown as EventSnapshot,
    ]),
  );
  const images: Map<string, PublicBlogImageDto> = await loadBlogImages(
    organizationId,
    [...snapshots.values()].flatMap(({ imageId }) =>
      imageId ? [imageId] : [],
    ),
  );
  return data.events
    .flatMap((row): PublicCalendarEventDto[] => {
      const snapshot = snapshots.get(row.id);
      if (!snapshot) return [];
      const picked = pickLocalizedValue(
        Object.entries(snapshot.translations).map(([locale, value]) => ({
          locale,
          ...value,
        })),
        served,
        (t) => t,
      );
      if (!picked) return [];
      const { names, color } = describeMinistries(snapshot.ministryIds, index);
      const place = eventPlaceOf(snapshot, data, served);
      const image = snapshot.imageId ? images.get(snapshot.imageId) : undefined;
      return [
        {
          uid: row.id,
          sequence: row.sequence,
          lastModified: (row.liveAt ?? new Date(0)).toISOString(),
          title: picked.title,
          ...(picked.description ? { description: picked.description } : {}),
          startDate: snapshot.startDate,
          ...(snapshot.startTime ? { startTime: snapshot.startTime } : {}),
          ...(snapshot.endDate ? { endDate: snapshot.endDate } : {}),
          ...(snapshot.endTime ? { endTime: snapshot.endTime } : {}),
          allDay: snapshot.allDay,
          ...(place ? { place } : {}),
          ministries: names,
          color,
          ...(image ? { image } : {}),
          ...(snapshot.linkUrl ? { linkUrl: snapshot.linkUrl } : {}),
          status: snapshot.status,
        },
      ];
    })
    .sort(byStart);
}

function toMinistryList(
  index: MinistryIndex,
  locale: string,
): PublicCalendarMinistryDto[] {
  return [...index.values()]
    .flatMap(({ name, slug, color }): PublicCalendarMinistryDto[] =>
      name ? [{ name, ...(slug ? { slug } : {}), color }] : [],
    )
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

/**
 * The public calendar of a year, in the requested language (the default one where a text lacks it).
 * Fixed public activities always; the activities of the year and its events (never the internal
 * ones) only when the year is published. A paused event is hidden; a cancelled one is shown as such.
 */
export async function getPublicCalendar(input: {
  organizationId: string;
  requestedLocale: string | undefined;
  year: number | undefined;
  now?: Date;
}): Promise<PublicCalendarDto> {
  const { organizationId, requestedLocale, year, now } = input;
  const organization = await findOrganizationLocales(organizationId);
  if (!organization) throw new NotFoundError("The church was not found");
  const { defaultLocale, locales } = organization;
  const locale = resolvePublicLocale(requestedLocale, locales, defaultLocale);
  const served = { locale, defaultLocale };

  const data = await loadPublicCalendar({
    organizationId,
    year,
    ...(now ? { now } : {}),
  });
  if (!data) throw new NotFoundError("The church was not found");
  const index = await indexMinistries(organizationId, served);

  return {
    year: data.year,
    published: data.published,
    timezone: data.timezone,
    ministries: toMinistryList(index, locale),
    weekly: toWeekly(data, index, served),
    exceptions: toExceptions(data, served),
    events: await toEvents(organizationId, data, index, served),
  };
}
