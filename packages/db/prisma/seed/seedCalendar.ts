import type { PrismaClient } from "../../src";

type Names = Record<string, string>;

interface SeedActivity {
  titles: Names;
  weekday: number;
  start: string;
  end: string | null;
  serviceKind: "WORSHIP" | "BIBLE_SCHOOL";
  annualReview: boolean;
}

const WEEKDAY_SUNDAY = 0;

const WORSHIP_TITLES: Names = {
  es: "Culto de adoración",
  en: "Worship service",
  pt: "Culto de adoração",
};
const BIBLE_SCHOOL_TITLES: Names = {
  es: "Escuela bíblica",
  en: "Bible school",
  pt: "Escola bíblica",
};

/** The regular schedule (the one the public site showed before phase 1.6). */
const REGULAR_ACTIVITIES: SeedActivity[] = [
  {
    titles: WORSHIP_TITLES,
    weekday: WEEKDAY_SUNDAY,
    start: "11:15",
    end: "13:00",
    serviceKind: "WORSHIP",
    annualReview: true,
  },
  {
    titles: BIBLE_SCHOOL_TITLES,
    weekday: WEEKDAY_SUNDAY,
    start: "10:00",
    end: null,
    serviceKind: "BIBLE_SCHOOL",
    annualReview: false,
  },
];

/** Summer set: one earlier worship, with no validity window so it is switched on by hand. */
const SUMMER_ACTIVITIES: SeedActivity[] = [
  {
    titles: WORSHIP_TITLES,
    weekday: WEEKDAY_SUNDAY,
    start: "10:30",
    end: "12:00",
    serviceKind: "WORSHIP",
    annualReview: false,
  },
];

const SCHEDULE_SETS = [
  {
    names: { es: "Habitual", en: "Regular", pt: "Habitual" } as Names,
    isDefault: true,
    order: 0,
    activities: REGULAR_ACTIVITIES,
  },
  {
    names: { es: "Verano", en: "Summer", pt: "Verão" } as Names,
    isDefault: false,
    order: 1,
    activities: SUMMER_ACTIVITIES,
  },
];

const PLACES = [
  {
    names: { es: "Templo", en: "Sanctuary", pt: "Templo" } as Names,
    address: "Av. Luis A. de Herrera 3101, Montevideo",
    order: 0,
  },
  {
    names: { es: "Salón anexo", en: "Annex hall", pt: "Salão anexo" } as Names,
    address: null,
    order: 1,
  },
];

const translationRows = <Key extends string>(
  names: Names,
  field: Key,
): Array<{ locale: string } & Record<Key, string>> =>
  Object.entries(names).map(
    ([locale, value]) =>
      ({ locale, [field]: value }) as { locale: string } & Record<Key, string>,
  );

/**
 * Dev data for the calendar schedule: the regular set (default) with the Sunday worship and Bible
 * school, a summer set and two places. The example activities of the old web mock are not seeded.
 * Idempotent: once the organization has any schedule set the seed leaves the calendar alone.
 */
export async function seedCalendar(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  const existing = await client.scheduleSet.count({
    where: { organizationId },
  });
  if (existing > 0) return;

  const [firstPlace] = await Promise.all(
    PLACES.map((place) =>
      client.place.create({
        data: {
          organizationId,
          address: place.address,
          order: place.order,
          translations: { create: translationRows(place.names, "name") },
        },
        select: { id: true },
      }),
    ),
  );

  for (const set of SCHEDULE_SETS) {
    await client.scheduleSet.create({
      data: {
        organizationId,
        isDefault: set.isDefault,
        order: set.order,
        translations: { create: translationRows(set.names, "name") },
        activities: {
          create: set.activities.map((activity) => ({
            organizationId,
            weekday: activity.weekday,
            start: activity.start,
            end: activity.end,
            serviceKind: activity.serviceKind,
            annualReview: activity.annualReview,
            isFixed: true,
            isPublic: true,
            placeId: firstPlace?.id ?? null,
            translations: { create: translationRows(activity.titles, "title") },
          })),
        },
      },
    });
  }
}
