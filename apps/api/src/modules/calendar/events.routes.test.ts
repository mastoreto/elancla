import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type CalendarYearDto,
  type CopyYearResultDto,
  type EditorialInboxDto,
  type EditorialStatusDto,
  type EventDto,
  type EventListDto,
  type EventListItemDto,
  type EventSnapshot,
  grant,
  PERMISSIONS,
  type PermissionGrant,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createRecordingMailer,
  type RecordingMailer,
} from "../../../test/support/recordingMailer";
import { getAuth } from "../../core/auth";
import { setMailerForTests } from "../../core/mail";
import { resolveOrganizationId } from "../../core/tenancy";
import { parseDateOnly, weekdayOf } from "./domain";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

// Far from the seeded years (2026, 2027) so the tests never touch them.
const YEAR_A = 2090;
const YEAR_B = 2091;
const SOURCE_YEAR = 2095;
const TARGET_YEAR = 2096;
const ALL_TEST_YEARS = [YEAR_A, YEAR_B, SOURCE_YEAR, TARGET_YEAR];
const STALE_OFFSET = 100;
const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

interface TestUser {
  id: string;
  email: string;
  cookie: string;
  roleIds: string[];
}

let organizationId = "";
let admin: TestUser;
let editor: TestUser;
let yearPublisher: TestUser;
let audienceMember: TestUser;
let outsider: TestUser;
let defaultSetId = "";
const createdActivityIds: string[] = [];

async function makeUser(
  label: string,
  access: readonly string[] | readonly PermissionGrant[],
): Promise<TestUser> {
  const auth = getAuth();
  const email = await fixtures.passwordUser(auth, label, access);
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const roles = await db.userRole.findMany({ where: { userId: user.id } });
  return {
    id: user.id,
    email,
    cookie: await fixtures.signIn(auth, email),
    roleIds: roles.map((role) => role.roleId),
  };
}

const EVENT_EDITOR = [
  grant(PERMISSIONS.events.view),
  grant(PERMISSIONS.events.create),
  grant(PERMISSIONS.events.edit),
  grant(PERMISSIONS.events.delete),
  grant(PERMISSIONS.events.publish),
];

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  admin = await makeUser("events-admin", ["admin"]);
  editor = await makeUser("events-editor", EVENT_EDITOR);
  yearPublisher = await makeUser("events-year-publisher", [
    ...EVENT_EDITOR,
    grant(PERMISSIONS.calendarYear.publish),
  ]);
  audienceMember = await makeUser("events-audience", [
    grant(PERMISSIONS.events.view),
    grant(PERMISSIONS.calendarInternal.view),
  ]);
  outsider = await makeUser("events-outsider", [
    grant(PERMISSIONS.events.view),
    grant(PERMISSIONS.calendarInternal.view),
  ]);
  const defaultSet = await db.scheduleSet.findFirstOrThrow({
    where: { organizationId, isDefault: true, deletedAt: null },
  });
  defaultSetId = defaultSet.id;
});

afterAll(async () => {
  setMailerForTests(undefined);
  await db.editorialSettings.deleteMany({
    where: { organizationId, contentType: "EVENT" },
  });
  await db.event.deleteMany({
    where: { organizationId, year: { in: ALL_TEST_YEARS } },
  });
  await db.recurringActivity.deleteMany({
    where: {
      organizationId,
      OR: [
        { year: { in: ALL_TEST_YEARS } },
        { id: { in: createdActivityIds } },
      ],
    },
  });
  await db.calendarYear.deleteMany({
    where: { organizationId, year: { in: ALL_TEST_YEARS } },
  });
  await fixtures.cleanup();
});

const codeOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { code: string }).code;

const snapshotFor = (
  year: number,
  overrides: Partial<EventSnapshot> = {},
): EventSnapshot => ({
  translations: { es: { title: `Evento ${year}` } },
  startDate: `${year}-06-06`,
  startTime: "10:00",
  allDay: false,
  placeMode: "tbc",
  ministryIds: [],
  status: "scheduled",
  ...overrides,
});

async function createYear(year: number): Promise<CalendarYearDto> {
  const res = await call("POST", "/content/calendar/years", {
    cookie: editor.cookie,
    body: { year },
  });
  expect(res.status).toBe(201);
  return (await res.json()) as CalendarYearDto;
}

async function createEvent(
  year: number,
  options: {
    visibility?: "public" | "internal";
    audienceRoleIds?: string[];
    user?: TestUser;
  } = {},
): Promise<EventDto> {
  const res = await call("POST", "/content/calendar/events", {
    cookie: (options.user ?? editor).cookie,
    body: {
      year,
      visibility: options.visibility ?? "public",
      audienceRoleIds: options.audienceRoleIds ?? [],
    },
  });
  expect(res.status).toBe(201);
  return (await res.json()) as EventDto;
}

const saveDraft = (
  eventId: string,
  snapshot: EventSnapshot,
  user: TestUser = editor,
) =>
  call("PUT", `/editorial/event/${eventId}/draft`, {
    cookie: user.cookie,
    body: { snapshot },
  });

const publishEvent = (eventId: string, user: TestUser = editor) =>
  call("POST", `/editorial/event/${eventId}/publish`, { cookie: user.cookie });

const publishYear = (year: number, user: TestUser = yearPublisher) =>
  call("POST", `/content/calendar/years/${year}/publish`, {
    cookie: user.cookie,
  });

async function statusOf(
  eventId: string,
  user: TestUser = editor,
): Promise<EditorialStatusDto> {
  const res = await call("GET", `/editorial/event/${eventId}`, {
    cookie: user.cookie,
  });
  expect(res.status).toBe(200);
  return (await res.json()) as EditorialStatusDto;
}

async function listEvents(
  year: number,
  user: TestUser = editor,
): Promise<EventListItemDto[]> {
  const res = await call("GET", `/content/calendar/events?year=${year}`, {
    cookie: user.cookie,
  });
  expect(res.status).toBe(200);
  return ((await res.json()) as EventListDto).items;
}

describe("a draft year and its events", () => {
  test("creating a year twice is a 409 year_exists, and a new year is a draft", async () => {
    const created = await createYear(YEAR_A);
    expect(created).toMatchObject({ year: YEAR_A, status: "draft" });
    const again = await call("POST", "/content/calendar/years", {
      cookie: editor.cookie,
      body: { year: YEAR_A },
    });
    expect(again.status).toBe(409);
    expect(await codeOf(again)).toBe("year_exists");
  });

  test("a single event of a draft year only saves a draft: publishing it is a 409 year_not_published", async () => {
    const event = await createEvent(YEAR_A);
    expect((await saveDraft(event.id, snapshotFor(YEAR_A))).status).toBe(200);
    const res = await publishEvent(event.id);
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("year_not_published");
  });

  test("the date has to fall in the year of the event (409 year_mismatch)", async () => {
    const event = await createEvent(YEAR_A);
    await saveDraft(event.id, snapshotFor(YEAR_B));
    const res = await publishEvent(event.id);
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("year_mismatch");
  });

  test("a place that does not exist is a 400 invalid_place", async () => {
    const event = await createEvent(YEAR_A);
    await saveDraft(
      event.id,
      snapshotFor(YEAR_A, { placeMode: "place", placeId: UNKNOWN_ID }),
    );
    const res = await publishEvent(event.id);
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_place");
  });

  test("a snapshot that breaks its own rules is a 400 on the draft", async () => {
    const event = await createEvent(YEAR_A);
    const res = await saveDraft(
      event.id,
      snapshotFor(YEAR_A, { endDate: `${YEAR_A}-06-01` }),
    );
    expect(res.status).toBe(400);
  });
});

describe("publishing the year", () => {
  test("goes live with every draft of the year in one transaction, and later edits go through the flow", async () => {
    await createYear(YEAR_B);
    const first = await createEvent(YEAR_B);
    const second = await createEvent(YEAR_B);
    await saveDraft(first.id, snapshotFor(YEAR_B));
    await saveDraft(
      second.id,
      snapshotFor(YEAR_B, { startDate: `${YEAR_B}-07-07` }),
    );

    expect((await publishYear(YEAR_B, editor)).status).toBe(403);
    const res = await publishYear(YEAR_B);
    expect(res.status).toBe(200);
    expect(((await res.json()) as CalendarYearDto).status).toBe("published");

    for (const event of [first, second]) {
      const status = await statusOf(event.id);
      expect(status.live?.state).toBe("published");
      expect(status.working).toBeNull();
    }
    const row = await db.event.findUniqueOrThrow({ where: { id: first.id } });
    expect(row.sequence).toBe(1);
    expect(row.liveAt).not.toBeNull();

    // Published: now each event follows the editorial flow and its sequence goes up.
    await saveDraft(first.id, snapshotFor(YEAR_B, { status: "cancelled" }));
    expect((await statusOf(first.id)).working?.state).toBe("draft");
    expect((await publishEvent(first.id)).status).toBe(200);
    const after = await db.event.findUniqueOrThrow({ where: { id: first.id } });
    expect(after.sequence).toBe(2);

    const audit = await auditRowsOf({
      action: "calendarYear.published",
      requestId: requestIdOf(res),
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.entityId).toBe(String(YEAR_B));
  });

  test("publishing twice is a 409 and an unknown year a 404", async () => {
    const again = await publishYear(YEAR_B);
    expect(again.status).toBe(409);
    expect(await codeOf(again)).toBe("year_already_published");
    expect((await publishYear(2099)).status).toBe(404);
  });

  test("one event that cannot go live stops the whole publication", async () => {
    const year = TARGET_YEAR;
    await createYear(year);
    const good = await createEvent(year);
    const bad = await createEvent(year);
    await saveDraft(good.id, snapshotFor(year));
    await saveDraft(bad.id, snapshotFor(year - 1));

    const res = await publishYear(year);
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("year_mismatch");
    const row = await db.calendarYear.findFirstOrThrow({
      where: { organizationId, year },
    });
    expect(row.status).toBe("DRAFT");
    expect((await statusOf(good.id)).live).toBeNull();

    await db.event.delete({ where: { id: bad.id } });
    await db.calendarYear.delete({ where: { id: row.id } });
    await db.event.delete({ where: { id: good.id } });
  });
});

describe("deleting events", () => {
  test("an event that was never published is deleted, with its draft retired", async () => {
    const event = await createEvent(YEAR_B);
    await saveDraft(event.id, snapshotFor(YEAR_B));
    const res = await call("DELETE", `/content/calendar/events/${event.id}`, {
      cookie: editor.cookie,
    });
    expect(res.status).toBe(204);
    expect(await db.event.findUnique({ where: { id: event.id } })).toBeNull();
    const revision = await db.contentRevision.findFirstOrThrow({
      where: { entityId: event.id, contentType: "EVENT" },
    });
    expect(revision.state).toBe("SUPERSEDED");
  });

  test("a published event cannot be deleted (409 event_live): it is cancelled", async () => {
    const [published] = (await listEvents(YEAR_B)).filter(
      (item) => item.isLive,
    );
    const res = await call(
      "DELETE",
      `/content/calendar/events/${published?.id}`,
      { cookie: editor.cookie },
    );
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("event_live");
  });
});

describe("internal events", () => {
  let internalId = "";

  test("only the audience and the admin see them, everywhere", async () => {
    const audienceRole = audienceMember.roleIds[0] as string;
    const event = await createEvent(YEAR_B, {
      visibility: "internal",
      audienceRoleIds: [audienceRole],
      user: admin,
    });
    internalId = event.id;
    await saveDraft(event.id, snapshotFor(YEAR_B), admin);

    const ids = async (user: TestUser) =>
      (await listEvents(YEAR_B, user)).map((item) => item.id);
    expect(await ids(admin)).toContain(internalId);
    expect(await ids(audienceMember)).toContain(internalId);
    expect(await ids(outsider)).not.toContain(internalId);
    expect(await ids(editor)).not.toContain(internalId);

    // The editorial routes of the event do not leak it either.
    for (const user of [audienceMember, admin]) {
      const res = await call("GET", `/editorial/event/${internalId}`, {
        cookie: user.cookie,
      });
      expect(res.status).toBe(200);
    }
    const hidden = await call("GET", `/editorial/event/${internalId}`, {
      cookie: outsider.cookie,
    });
    expect(hidden.status).toBe(404);
    const hiddenHistory = await call(
      "GET",
      `/editorial/event/${internalId}/history`,
      { cookie: outsider.cookie },
    );
    expect(hiddenHistory.status).toBe(404);
  });

  test("the settings and the deletion of an internal event are a 404 outside the audience", async () => {
    const settings = await call(
      "PATCH",
      `/content/calendar/events/${internalId}/settings`,
      {
        cookie: editor.cookie,
        body: { visibility: "public", audienceRoleIds: [], version: 1 },
      },
    );
    expect(settings.status).toBe(404);
    const removal = await call(
      "DELETE",
      `/content/calendar/events/${internalId}`,
      { cookie: editor.cookie },
    );
    expect(removal.status).toBe(404);
  });

  test("visibility and audience are direct changes with a version lock and an audit row", async () => {
    const audienceRole = audienceMember.roleIds[0] as string;
    const event = await db.event.findUniqueOrThrow({
      where: { id: internalId },
    });
    const stale = await call(
      "PATCH",
      `/content/calendar/events/${internalId}/settings`,
      {
        cookie: admin.cookie,
        body: {
          visibility: "internal",
          audienceRoleIds: [audienceRole],
          version: event.version + STALE_OFFSET,
        },
      },
    );
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");

    const unknownRole = await call(
      "PATCH",
      `/content/calendar/events/${internalId}/settings`,
      {
        cookie: admin.cookie,
        body: {
          visibility: "internal",
          audienceRoleIds: [UNKNOWN_ID],
          version: event.version,
        },
      },
    );
    expect(unknownRole.status).toBe(400);

    const ok = await call(
      "PATCH",
      `/content/calendar/events/${internalId}/settings`,
      {
        cookie: admin.cookie,
        body: {
          visibility: "internal",
          audienceRoleIds: [outsider.roleIds[0] as string],
          version: event.version,
        },
      },
    );
    expect(ok.status).toBe(200);
    const saved = (await ok.json()) as EventDto;
    expect(saved.version).toBe(event.version + 1);
    // The audience moved: the former member no longer sees it, the new one does.
    const ids = async (user: TestUser) =>
      (await listEvents(YEAR_B, user)).map((item) => item.id);
    expect(await ids(audienceMember)).not.toContain(internalId);
    expect(await ids(outsider)).toContain(internalId);
    const audit = await auditRowsOf({
      action: "event.settingsUpdated",
      entityId: internalId,
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.before).toMatchObject({ version: event.version });
    expect(audit[0]?.after).toMatchObject({ version: event.version + 1 });
  });
});

describe("copying from the previous year", () => {
  const eventIds: string[] = [];
  const activityIds: string[] = [];

  async function createSourceActivity(
    year: number,
    start: string,
  ): Promise<string> {
    const activity = await db.recurringActivity.create({
      data: {
        organizationId,
        scheduleSetId: defaultSetId,
        weekday: 3,
        start,
        isFixed: false,
        year,
        translations: {
          create: [{ locale: "es", title: `Actividad ${start}` }],
        },
      },
    });
    createdActivityIds.push(activity.id);
    return activity.id;
  }

  beforeAll(async () => {
    await createYear(SOURCE_YEAR);
    for (const date of ["03-13", "05-08", "11-20"]) {
      const event = await createEvent(SOURCE_YEAR);
      await saveDraft(
        event.id,
        snapshotFor(SOURCE_YEAR, {
          startDate: `${SOURCE_YEAR}-${date}`,
          endDate: date === "05-08" ? `${SOURCE_YEAR}-05-10` : undefined,
        }),
      );
      eventIds.push(event.id);
    }
    activityIds.push(
      await createSourceActivity(SOURCE_YEAR, "18:00"),
      await createSourceActivity(SOURCE_YEAR, "19:00"),
    );
    expect((await publishYear(SOURCE_YEAR)).status).toBe(200);
    await createYear(TARGET_YEAR);
  });

  const copy = (body: unknown, year: number = TARGET_YEAR) =>
    call("POST", `/content/calendar/years/${year}/copy`, {
      cookie: editor.cookie,
      body,
    });

  test("copies exactly the selection, marks it for review and moves the dates keeping the weekday", async () => {
    const selected = [eventIds[0] as string, eventIds[1] as string];
    const res = await copy({
      fromYear: SOURCE_YEAR,
      eventIds: selected,
      activityIds: [activityIds[0] as string],
      keepExactDates: false,
    });
    expect(res.status).toBe(200);
    expect((await res.json()) as CopyYearResultDto).toEqual({
      activities: 1,
      events: 2,
    });

    const copied = await listEvents(TARGET_YEAR);
    expect(copied).toHaveLength(2);
    for (const item of copied) {
      expect(item.needsReview).toBe(true);
      expect(item.editorialState).toBe("draft");
      expect(item.isLive).toBe(false);
      expect(item.startDate?.startsWith(String(TARGET_YEAR))).toBe(true);
    }
    const sources = await Promise.all(
      selected.map((id) =>
        db.contentRevision.findFirstOrThrow({
          where: { entityId: id, contentType: "EVENT" },
        }),
      ),
    );
    const sourceWeekdays = sources
      .map((row) =>
        weekdayOf((row.snapshot as { startDate: string }).startDate),
      )
      .sort();
    expect(
      copied.map((item) => weekdayOf(item.startDate as string)).sort(),
    ).toEqual(sourceWeekdays);
    // The multi-day event keeps its length.
    const multiDay = copied.find((item) => item.endDate !== null);
    const lengthInDays =
      (parseDateOnly(multiDay?.endDate as string).getTime() -
        parseDateOnly(multiDay?.startDate as string).getTime()) /
      86_400_000;
    expect(lengthInDays).toBe(2);

    const activities = await db.recurringActivity.findMany({
      where: { organizationId, year: TARGET_YEAR, deletedAt: null },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      needsReview: true,
      isFixed: false,
      start: "18:00",
    });
    const audit = await auditRowsOf({
      action: "calendarYear.copied",
      requestId: requestIdOf(res),
    });
    expect(audit).toHaveLength(1);
    expect(audit[0]?.metadata).toMatchObject({ fromYear: SOURCE_YEAR });
  });

  test("keepExactDates keeps the day of the month", async () => {
    const res = await copy({
      fromYear: SOURCE_YEAR,
      eventIds: [eventIds[2] as string],
      activityIds: [],
      keepExactDates: true,
    });
    expect(res.status).toBe(200);
    const dates = (await listEvents(TARGET_YEAR)).map((item) => item.startDate);
    expect(dates).toContain(`${TARGET_YEAR}-11-20`);
  });

  test("an id that is not copiable from that year is a 400 and nothing is copied", async () => {
    const before = (await listEvents(TARGET_YEAR)).length;
    const res = await copy({
      fromYear: SOURCE_YEAR,
      eventIds: [eventIds[0] as string, UNKNOWN_ID],
      activityIds: [],
      keepExactDates: false,
    });
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_copy_selection");
    expect(await listEvents(TARGET_YEAR)).toHaveLength(before);

    const fixed = await db.recurringActivity.findFirstOrThrow({
      where: { organizationId, isFixed: true, deletedAt: null },
    });
    const fixedRes = await copy({
      fromYear: SOURCE_YEAR,
      eventIds: [],
      activityIds: [fixed.id],
      keepExactDates: false,
    });
    expect(fixedRes.status).toBe(400);
  });

  test("only a draft year receives a copy", async () => {
    const res = await copy(
      {
        fromYear: SOURCE_YEAR,
        eventIds: [eventIds[0] as string],
        activityIds: [],
        keepExactDates: false,
      },
      YEAR_B,
    );
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("year_not_draft");
  });

  test("publishing the target year takes the copied drafts live", async () => {
    expect((await publishYear(TARGET_YEAR)).status).toBe(200);
    const items = await listEvents(TARGET_YEAR);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.isLive)).toBe(true);
    expect(items.every((item) => !item.needsReview)).toBe(true);
  });
});

describe("internal events in the review inbox and emails", () => {
  test("a reviewer outside the audience sees nothing and is not mailed; one inside is", async () => {
    const reviewerIn = await makeUser("events-reviewer-in", [
      grant(PERMISSIONS.events.view),
      grant(PERMISSIONS.calendarInternal.view),
    ]);
    const reviewerOut = await makeUser("events-reviewer-out", [
      grant(PERMISSIONS.events.view),
      grant(PERMISSIONS.calendarInternal.view),
    ]);
    await db.editorialSettings.deleteMany({
      where: { organizationId, contentType: "EVENT" },
    });
    await db.editorialSettings.create({
      data: {
        organizationId,
        contentType: "EVENT",
        reviewerUserIds: [reviewerIn.id, reviewerOut.id],
      },
    });
    const mailer: RecordingMailer = createRecordingMailer();
    setMailerForTests(mailer);

    const internal = await createEvent(YEAR_B, {
      visibility: "internal",
      audienceRoleIds: [reviewerIn.roleIds[0] as string],
      user: admin,
    });
    await saveDraft(internal.id, snapshotFor(YEAR_B), admin);
    const submitted = await call(
      "POST",
      `/editorial/event/${internal.id}/submit`,
      {
        cookie: admin.cookie,
      },
    );
    expect(submitted.status).toBe(200);

    const inboxOf = async (user: TestUser): Promise<EditorialInboxDto> =>
      (await (
        await call("GET", "/editorial/inbox", { cookie: user.cookie })
      ).json()) as EditorialInboxDto;
    const inside = await inboxOf(reviewerIn);
    expect(inside.toReview.map((item) => item.entityId)).toContain(internal.id);
    const outside = await inboxOf(reviewerOut);
    expect(outside.toReview.map((item) => item.entityId)).not.toContain(
      internal.id,
    );
    expect(mailer.sent.map((message) => message.to)).toEqual([
      reviewerIn.email,
    ]);

    // A public event reaches both reviewers.
    mailer.sent.length = 0;
    const open = await createEvent(YEAR_B, { user: admin });
    await saveDraft(open.id, snapshotFor(YEAR_B), admin);
    await call("POST", `/editorial/event/${open.id}/submit`, {
      cookie: admin.cookie,
    });
    expect(mailer.sent.map((message) => message.to).sort()).toEqual(
      [reviewerIn.email, reviewerOut.email].sort(),
    );
    expect(
      (await inboxOf(reviewerOut)).toReview.map((item) => item.entityId),
    ).toContain(open.id);
  });
});

describe("places used by events", () => {
  test("a place an event points at cannot be deleted until the event lets go of it", async () => {
    const created = await call("POST", "/content/calendar/places", {
      cookie: editor.cookie,
      body: {
        address: null,
        mapsUrl: null,
        order: 0,
        translations: { es: { name: "Lugar de prueba (eventos)" } },
      },
    });
    expect(created.status).toBe(201);
    const place = (await created.json()) as { id: string };
    const event = await createEvent(YEAR_B);
    await saveDraft(
      event.id,
      snapshotFor(YEAR_B, { placeMode: "place", placeId: place.id }),
    );

    const blocked = await call(
      "DELETE",
      `/content/calendar/places/${place.id}`,
      {
        cookie: editor.cookie,
      },
    );
    expect(blocked.status).toBe(409);
    expect(await codeOf(blocked)).toBe("place_in_use");

    await call("DELETE", `/content/calendar/events/${event.id}`, {
      cookie: editor.cookie,
    });
    const freed = await call("DELETE", `/content/calendar/places/${place.id}`, {
      cookie: editor.cookie,
    });
    expect(freed.status).toBe(204);
    await db.place.deleteMany({ where: { id: place.id } });
  });
});

describe("annual review", () => {
  test("confirms a fixed activity with annual review, once, and refuses the rest", async () => {
    const reviewable = await db.recurringActivity.create({
      data: {
        organizationId,
        scheduleSetId: defaultSetId,
        weekday: 3,
        start: "07:00",
        isFixed: true,
        annualReview: true,
        translations: { create: [{ locale: "es", title: "Revisable" }] },
      },
    });
    const plain = await db.recurringActivity.create({
      data: {
        organizationId,
        scheduleSetId: defaultSetId,
        weekday: 3,
        start: "07:30",
        isFixed: true,
        translations: { create: [{ locale: "es", title: "Sin revisión" }] },
      },
    });
    createdActivityIds.push(reviewable.id, plain.id);
    const confirm = (activityId: string) =>
      call("POST", `/content/calendar/years/${YEAR_B}/reviews`, {
        cookie: editor.cookie,
        body: { activityId },
      });

    const first = await confirm(reviewable.id);
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as { confirmedAt: string };
    const second = await confirm(reviewable.id);
    expect(((await second.json()) as { confirmedAt: string }).confirmedAt).toBe(
      firstBody.confirmedAt,
    );
    expect(
      await db.activityYearReview.count({
        where: { activityId: reviewable.id, year: YEAR_B },
      }),
    ).toBe(1);

    const notReviewable = await confirm(plain.id);
    expect(notReviewable.status).toBe(400);
    expect(await codeOf(notReviewable)).toBe("not_reviewable");
    expect((await confirm(UNKNOWN_ID)).status).toBe(404);
  });
});
