import { eventSnapshot } from "@ancla/contracts";
import type { Prisma, PrismaClient } from "../../src";

type Names = Record<string, string>;
type PlaceKey = "temple" | "hall" | "tbc";

interface SeedEvent {
  titles: Names;
  /** Already moved to the seed year with the weekday kept (what `shiftDateKeepingWeekday` does). */
  date: string;
  time: string;
  place: PlaceKey;
  ministrySlug: string | null;
}

const CURRENT_YEAR = 2026;
const NEXT_YEAR = 2027;
const INTERNAL_AUDIENCE_ROLE_KEY = "leader";

const PLACE_NAMES: Record<Exclude<PlaceKey, "tbc">, string> = {
  temple: "Templo",
  hall: "Salón anexo",
};

const t = (es: string, en: string, pt: string): Names => ({ es, en, pt });

const OPENING = t(
  "Culto de apertura del año",
  "Opening service of the year",
  "Culto de abertura do ano",
);
const TEACHING_WORKSHOP = t(
  "Taller de enseñanza bíblica",
  "Bible teaching workshop",
  "Oficina de ensino bíblico",
);
const WORSHIP_NIGHT = t(
  "Noche de alabanza",
  "Night of worship",
  "Noite de louvor",
);
const WOMEN = t(
  "Encuentro de mujeres",
  "Women's gathering",
  "Encontro de mulheres",
);
const TEEN_RETREAT = t(
  "Retiro de adolescentes",
  "Teen retreat",
  "Retiro de adolescentes",
);
const HOLY_WEEK = t(
  "Vigilia de Semana Santa",
  "Holy Week vigil",
  "Vigília da Semana Santa",
);
const MEN_DINNER = t("Cena de hombres", "Men's dinner", "Jantar de homens");
const YOUTH = t(
  "Encuentro de jóvenes",
  "Youth gathering",
  "Encontro de jovens",
);
const PRAYER_NIGHT = t(
  "Noche de oración",
  "Night of prayer",
  "Noite de oração",
);
const MISSION_DAY = t(
  "Jornada misionera",
  "Mission day",
  "Jornada missionária",
);
const MEDIA_WORKSHOP = t(
  "Taller de multimedia",
  "Media workshop",
  "Oficina de multimídia",
);
const TEEN_CAMP = t(
  "Campamento de adolescentes",
  "Teen camp",
  "Acampamento de adolescentes",
);
const MISSIONS_CONFERENCE = t(
  "Conferencia de misiones",
  "Missions conference",
  "Conferência de missões",
);
const CHRISTMAS_SERVICE = t(
  "Culto de Navidad",
  "Christmas service",
  "Culto de Natal",
);
const CHRISTMAS = t(
  "Celebración de Navidad",
  "Christmas celebration",
  "Celebração de Natal",
);

/** The sample events of the old web mock (2027), moved to the current seed year. */
const PUBLIC_EVENTS: SeedEvent[] = [
  {
    titles: OPENING,
    date: "2026-01-17",
    time: "11:15",
    place: "temple",
    ministrySlug: "predicacion",
  },
  {
    titles: TEACHING_WORKSHOP,
    date: "2026-02-07",
    time: "16:00",
    place: "hall",
    ministrySlug: "ensenanza",
  },
  {
    titles: WORSHIP_NIGHT,
    date: "2026-02-21",
    time: "20:00",
    place: "temple",
    ministrySlug: "alabanza",
  },
  {
    titles: WOMEN,
    date: "2026-03-13",
    time: "19:30",
    place: "hall",
    ministrySlug: "espacio-mujer",
  },
  {
    titles: TEEN_RETREAT,
    date: "2026-03-28",
    time: "10:00",
    place: "tbc",
    ministrySlug: "adolescentes",
  },
  {
    titles: HOLY_WEEK,
    date: "2026-04-10",
    time: "21:00",
    place: "temple",
    ministrySlug: "oracion",
  },
  {
    titles: MEN_DINNER,
    date: "2026-04-25",
    time: "20:00",
    place: "hall",
    ministrySlug: "hombres",
  },
  {
    titles: YOUTH,
    date: "2026-05-09",
    time: "19:30",
    place: "hall",
    ministrySlug: "jovenes",
  },
  {
    titles: MEN_DINNER,
    date: "2026-05-17",
    time: "20:00",
    place: "hall",
    ministrySlug: "hombres",
  },
  {
    titles: PRAYER_NIGHT,
    date: "2026-05-22",
    time: "20:00",
    place: "temple",
    ministrySlug: "oracion",
  },
  {
    titles: MISSION_DAY,
    date: "2026-05-30",
    time: "10:00",
    place: "tbc",
    ministrySlug: "misiones",
  },
  {
    titles: MEDIA_WORKSHOP,
    date: "2026-06-06",
    time: "16:00",
    place: "hall",
    ministrySlug: "multimedia",
  },
  {
    titles: YOUTH,
    date: "2026-06-20",
    time: "19:30",
    place: "hall",
    ministrySlug: "jovenes",
  },
  {
    titles: MISSION_DAY,
    date: "2026-07-04",
    time: "10:00",
    place: "tbc",
    ministrySlug: "misiones",
  },
  {
    titles: PRAYER_NIGHT,
    date: "2026-07-18",
    time: "20:00",
    place: "temple",
    ministrySlug: "oracion",
  },
  {
    titles: WOMEN,
    date: "2026-08-08",
    time: "19:30",
    place: "hall",
    ministrySlug: "espacio-mujer",
  },
  {
    titles: MEN_DINNER,
    date: "2026-08-22",
    time: "20:00",
    place: "hall",
    ministrySlug: "hombres",
  },
  {
    titles: TEEN_CAMP,
    date: "2026-09-05",
    time: "09:00",
    place: "tbc",
    ministrySlug: "adolescentes",
  },
  {
    titles: WORSHIP_NIGHT,
    date: "2026-09-19",
    time: "20:00",
    place: "temple",
    ministrySlug: "alabanza",
  },
  {
    titles: YOUTH,
    date: "2026-10-03",
    time: "19:30",
    place: "hall",
    ministrySlug: "jovenes",
  },
  {
    titles: TEACHING_WORKSHOP,
    date: "2026-10-17",
    time: "16:00",
    place: "hall",
    ministrySlug: "ensenanza",
  },
  {
    titles: MISSIONS_CONFERENCE,
    date: "2026-10-31",
    time: "10:00",
    place: "tbc",
    ministrySlug: "misiones",
  },
  {
    titles: PRAYER_NIGHT,
    date: "2026-11-07",
    time: "20:00",
    place: "temple",
    ministrySlug: "oracion",
  },
  {
    titles: MEN_DINNER,
    date: "2026-11-21",
    time: "20:00",
    place: "hall",
    ministrySlug: "hombres",
  },
  {
    titles: WOMEN,
    date: "2026-12-12",
    time: "19:30",
    place: "hall",
    ministrySlug: "espacio-mujer",
  },
  {
    titles: CHRISTMAS_SERVICE,
    date: "2026-12-19",
    time: "19:00",
    place: "temple",
    ministrySlug: "predicacion",
  },
  {
    titles: CHRISTMAS,
    date: "2026-12-26",
    time: "11:15",
    place: "temple",
    ministrySlug: "predicacion",
  },
];

const INTERNAL_EVENT: SeedEvent = {
  titles: t("Reunión de líderes", "Leaders' meeting", "Reunião de líderes"),
  date: "2026-12-05",
  time: "19:00",
  place: "tbc",
  ministrySlug: null,
};

const toJson = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

async function findAuthorUserId(
  client: PrismaClient,
  organizationId: string,
): Promise<string | null> {
  const user = await client.user.findFirst({
    where: { userRoles: { some: { role: { organizationId } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function ensureYear(
  client: PrismaClient,
  organizationId: string,
  year: number,
  status: "DRAFT" | "PUBLISHED",
): Promise<void> {
  await client.calendarYear.upsert({
    where: { organizationId_year: { organizationId, year } },
    create: {
      organizationId,
      year,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
    update: {},
  });
}

interface SeedReferences {
  ministryIds: Map<string, string>;
  placeIds: Map<PlaceKey, string>;
  audienceRoleId: string | null;
}

async function loadReferences(
  client: PrismaClient,
  organizationId: string,
): Promise<SeedReferences> {
  const [ministries, places, role] = await Promise.all([
    client.ministry.findMany({
      where: { organizationId },
      select: { id: true, slug: true },
    }),
    client.place.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true, translations: { where: { locale: "es" } } },
    }),
    client.role.findFirst({
      where: { organizationId, key: INTERNAL_AUDIENCE_ROLE_KEY },
      select: { id: true },
    }),
  ]);
  const placeIds = new Map<PlaceKey, string>();
  for (const [key, name] of Object.entries(PLACE_NAMES)) {
    const found = places.find((place) =>
      place.translations.some((translation) => translation.name === name),
    );
    if (found) placeIds.set(key as PlaceKey, found.id);
  }
  return {
    ministryIds: new Map(ministries.map(({ id, slug }) => [slug, id])),
    placeIds,
    audienceRoleId: role?.id ?? null,
  };
}

function snapshotOf(event: SeedEvent, references: SeedReferences): unknown {
  const placeId =
    event.place === "tbc" ? undefined : references.placeIds.get(event.place);
  const ministryId = event.ministrySlug
    ? references.ministryIds.get(event.ministrySlug)
    : undefined;
  return eventSnapshot.parse({
    translations: Object.fromEntries(
      Object.entries(event.titles).map(([locale, title]) => [
        locale,
        { title },
      ]),
    ),
    startDate: event.date,
    startTime: event.time,
    allDay: false,
    placeMode: placeId ? "place" : "tbc",
    ...(placeId ? { placeId } : {}),
    ministryIds: ministryId ? [ministryId] : [],
    status: "scheduled",
  });
}

async function createLiveEvent(
  client: PrismaClient,
  input: {
    organizationId: string;
    authorId: string;
    event: SeedEvent;
    references: SeedReferences;
    internalAudienceRoleId?: string | null;
  },
): Promise<void> {
  const { organizationId, authorId, event, references } = input;
  const now = new Date();
  const internal = input.internalAudienceRoleId !== undefined;
  const row = await client.event.create({
    data: {
      organizationId,
      year: CURRENT_YEAR,
      visibility: internal ? "INTERNAL" : "PUBLIC",
      sequence: 1,
      liveAt: now,
      ...(internal && input.internalAudienceRoleId
        ? {
            audienceRoles: {
              create: [{ roleId: input.internalAudienceRoleId }],
            },
          }
        : {}),
    },
    select: { id: true },
  });
  await client.contentRevision.create({
    data: {
      organizationId,
      contentType: "EVENT",
      entityId: row.id,
      number: 1,
      state: "PUBLISHED",
      snapshot: toJson(snapshotOf(event, references)),
      authorId,
      publishedAt: now,
    },
  });
}

/**
 * Dev data for the calendar year (phase 1.6b): the current year published with the sample events of
 * the old web mock (es/en/pt, moved to that year keeping the weekday), the next year as an empty
 * draft and one internal event for the leaders. Idempotent: once the organization has any event the
 * seed leaves them alone, so CRM edits survive. Revisions are written PUBLISHED directly (what
 * `publish` leaves), so their author is the oldest user holding a role; without one the events wait
 * for the next run, like the ministry profiles. Needs the roles, ministries and calendar seeds first.
 */
export async function seedCalendarEvents(
  client: PrismaClient,
  organizationId: string,
): Promise<void> {
  await ensureYear(client, organizationId, CURRENT_YEAR, "PUBLISHED");
  await ensureYear(client, organizationId, NEXT_YEAR, "DRAFT");

  const existing = await client.event.count({ where: { organizationId } });
  if (existing > 0) return;
  const authorId = await findAuthorUserId(client, organizationId);
  if (!authorId) {
    console.info("Calendar events skipped: no user to author them yet.");
    return;
  }

  const references = await loadReferences(client, organizationId);
  for (const event of PUBLIC_EVENTS) {
    await createLiveEvent(client, {
      organizationId,
      authorId,
      event,
      references,
    });
  }
  await createLiveEvent(client, {
    organizationId,
    authorId,
    event: INTERNAL_EVENT,
    references,
    internalAudienceRoleId: references.audienceRoleId,
  });
}
