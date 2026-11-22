import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  grant,
  PERMISSIONS,
  type PlaceDto,
  type RecurringActivityDto,
  type ScheduleExceptionDto,
  type ScheduleSetDto,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import { createApiCaller } from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import { getAuth } from "../../core/auth";
import { resolveOrganizationId } from "../../core/tenancy";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);

const STALE_OFFSET = 100;
const FAR_FUTURE_YEAR = 2090;

let organizationId = "";
let editorCookie = "";
let viewerCookie = "";
let nobodyCookie = "";
let ministryId = "";

const createdPlaces: string[] = [];
const createdSets: string[] = [];
const createdExceptions: string[] = [];
const flagsBefore: { id: string; isDefault: boolean; forcedActive: boolean }[] =
  [];

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  flagsBefore.push(
    ...(await db.scheduleSet.findMany({
      where: { organizationId },
      select: { id: true, isDefault: true, forcedActive: true },
    })),
  );
  const auth = getAuth();
  editorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "calendar-editor", [
      grant(PERMISSIONS.events.view),
      grant(PERMISSIONS.events.edit),
    ]),
  );
  viewerCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "calendar-viewer", [
      grant(PERMISSIONS.events.view),
    ]),
  );
  nobodyCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "calendar-nobody", []),
  );
  ministryId = await fixtures.createMinistry("calendar");
});

afterAll(async () => {
  await db.scheduleException.deleteMany({
    where: { id: { in: createdExceptions } },
  });
  await db.scheduleSet.deleteMany({ where: { id: { in: createdSets } } });
  await db.place.deleteMany({ where: { id: { in: createdPlaces } } });
  for (const set of flagsBefore) {
    await db.scheduleSet.update({
      where: { id: set.id },
      data: { isDefault: set.isDefault, forcedActive: set.forcedActive },
    });
  }
  await fixtures.cleanup();
});

const post = (path: string, body: unknown, cookie = editorCookie) =>
  call("POST", `/content/calendar/${path}`, { cookie, body });
const patch = (path: string, body: unknown, cookie = editorCookie) =>
  call("PATCH", `/content/calendar/${path}`, { cookie, body });
const del = (path: string, cookie = editorCookie) =>
  call("DELETE", `/content/calendar/${path}`, { cookie });
const get = (path: string, cookie = editorCookie) =>
  call("GET", `/content/calendar/${path}`, { cookie });
const codeOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { code: string }).code;

async function createPlace(
  overrides: Record<string, unknown> = {},
): Promise<PlaceDto> {
  const res = await post("places", {
    address: "Calle 1",
    mapsUrl: null,
    order: 0,
    translations: { es: { name: "Salón (test)" } },
    ...overrides,
  });
  expect(res.status).toBe(201);
  const place = (await res.json()) as PlaceDto;
  createdPlaces.push(place.id);
  return place;
}

async function createSet(
  overrides: Record<string, unknown> = {},
): Promise<ScheduleSetDto> {
  const res = await post("schedule-sets", {
    validFrom: null,
    validTo: null,
    isDefault: false,
    forcedActive: false,
    order: 50,
    translations: { es: { name: "Conjunto (test)" } },
    ...overrides,
  });
  expect(res.status).toBe(201);
  const set = (await res.json()) as ScheduleSetDto;
  createdSets.push(set.id);
  return set;
}

const activityBody = (
  scheduleSetId: string,
  overrides: Record<string, unknown> = {},
) => ({
  scheduleSetId,
  weekday: 3,
  start: "19:30",
  end: "21:00",
  placeId: null,
  serviceKind: null,
  isPublic: true,
  year: null,
  annualReview: false,
  ministryIds: [],
  translations: { es: { title: "Reunión (test)" } },
  ...overrides,
});

async function createActivity(
  scheduleSetId: string,
  overrides: Record<string, unknown> = {},
): Promise<RecurringActivityDto> {
  const res = await post("activities", activityBody(scheduleSetId, overrides));
  expect(res.status).toBe(201);
  return (await res.json()) as RecurringActivityDto;
}

describe("places", () => {
  test("creates, lists and audits with the request id", async () => {
    const res = await post("places", {
      address: "Calle 2",
      mapsUrl: "https://maps.example/x",
      order: 1,
      translations: { es: { name: "Auditorio (test)" } },
    });
    expect(res.status).toBe(201);
    const place = (await res.json()) as PlaceDto;
    createdPlaces.push(place.id);
    expect(place.version).toBe(1);

    const rows = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "place.created",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.entityId).toBe(place.id);

    const list = (await (await get("places")).json()) as { items: PlaceDto[] };
    expect(list.items.map((item) => item.id)).toContain(place.id);
  });

  test("a PATCH bumps the version and audits before and after", async () => {
    const place = await createPlace();
    const res = await patch(`places/${place.id}`, {
      address: "Calle nueva",
      mapsUrl: null,
      order: 2,
      translations: { es: { name: "Salón renovado (test)" } },
      version: place.version,
    });
    expect(res.status).toBe(200);
    const after = (await res.json()) as PlaceDto;
    expect(after.version).toBe(place.version + 1);
    expect(after.translations.es?.name).toBe("Salón renovado (test)");

    const [row] = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "place.updated",
    });
    expect(JSON.stringify(row?.before)).toContain("Salón (test)");
    expect(JSON.stringify(row?.after)).toContain("Salón renovado (test)");
  });

  test("a stale version is a 409 stale_version", async () => {
    const place = await createPlace();
    const res = await patch(`places/${place.id}`, {
      address: null,
      mapsUrl: null,
      order: 0,
      translations: { es: { name: "Nunca" } },
      version: place.version + STALE_OFFSET,
    });
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("stale_version");
  });

  test("a language the church does not use is a 400", async () => {
    const res = await post("places", {
      address: null,
      mapsUrl: null,
      order: 0,
      translations: { es: { name: "Sí" }, fr: { name: "Non" } },
    });
    expect(res.status).toBe(400);
  });

  test("a place an activity uses cannot be deleted (409 place_in_use) until it is free", async () => {
    const set = await createSet();
    const place = await createPlace();
    const activity = await createActivity(set.id, { placeId: place.id });

    const refused = await del(`places/${place.id}`);
    expect(refused.status).toBe(409);
    expect(await codeOf(refused)).toBe("place_in_use");

    expect((await del(`activities/${activity.id}`)).status).toBe(204);
    expect((await del(`places/${place.id}`)).status).toBe(204);
    const list = (await (await get("places")).json()) as { items: PlaceDto[] };
    expect(list.items.map((item) => item.id)).not.toContain(place.id);
  });
});

describe("schedule sets", () => {
  test("turning isDefault on moves it: the church never has two defaults", async () => {
    const first = await createSet({ isDefault: true });
    const second = await createSet({ isDefault: true });
    const list = (await (await get("schedule-sets")).json()) as {
      items: ScheduleSetDto[];
    };
    const defaults = list.items.filter((item) => item.isDefault);
    expect(defaults.map((item) => item.id)).toEqual([second.id]);
    expect(list.items.some((item) => item.id === first.id)).toBe(true);
  });

  test("the manual switch is exclusive too, and PATCH can turn it off", async () => {
    const first = await createSet({ forcedActive: true });
    const second = await createSet({ forcedActive: true });
    const forced = async () =>
      (
        (await (await get("schedule-sets")).json()) as {
          items: ScheduleSetDto[];
        }
      ).items
        .filter((item) => item.forcedActive)
        .map((item) => item.id);
    expect(await forced()).toEqual([second.id]);

    const current = (await (await get("schedule-sets")).json()) as {
      items: ScheduleSetDto[];
    };
    const row = current.items.find((item) => item.id === second.id);
    const res = await patch(`schedule-sets/${second.id}`, {
      validFrom: null,
      validTo: null,
      isDefault: false,
      forcedActive: false,
      order: 50,
      translations: { es: { name: "Conjunto (test)" } },
      version: row?.version ?? 0,
    });
    expect(res.status).toBe(200);
    expect(await forced()).toEqual([]);
    expect(first.id).not.toBe(second.id);
  });

  test("a validity window that ends before it starts is a 400", async () => {
    const res = await post("schedule-sets", {
      validFrom: "2027-02-01",
      validTo: "2027-01-01",
      isDefault: false,
      forcedActive: false,
      order: 0,
      translations: { es: { name: "Mal" } },
    });
    expect(res.status).toBe(400);
  });

  test("a stale version is a 409 stale_version", async () => {
    const set = await createSet();
    const res = await patch(`schedule-sets/${set.id}`, {
      validFrom: null,
      validTo: null,
      isDefault: false,
      forcedActive: false,
      order: 0,
      translations: { es: { name: "Nunca" } },
      version: set.version + STALE_OFFSET,
    });
    expect(res.status).toBe(409);
    expect(await codeOf(res)).toBe("stale_version");
  });

  test("a set an exception replaces with cannot be deleted; a free one can", async () => {
    const set = await createSet();
    const exception = await post("exceptions", {
      date: "2091-12-25",
      replacementSetId: set.id,
      translations: { es: { message: "Navidad (test)" } },
    });
    expect(exception.status).toBe(201);
    createdExceptions.push(
      ((await exception.json()) as ScheduleExceptionDto).id,
    );

    const refused = await del(`schedule-sets/${set.id}`);
    expect(refused.status).toBe(409);
    expect(await codeOf(refused)).toBe("schedule_set_in_use");

    const free = await createSet();
    const res = await del(`schedule-sets/${free.id}`);
    expect(res.status).toBe(204);
    const [row] = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "scheduleSet.deleted",
    });
    expect(row?.entityId).toBe(free.id);
  });
});

describe("recurring activities", () => {
  test("a fixed activity has no year; one of a year is not fixed", async () => {
    const set = await createSet();
    const fixed = await createActivity(set.id);
    expect(fixed.isFixed).toBe(true);
    expect(fixed.year).toBeNull();
    const ofYear = await createActivity(set.id, { year: FAR_FUTURE_YEAR });
    expect(ofYear.isFixed).toBe(false);
    expect(ofYear.year).toBe(FAR_FUTURE_YEAR);
  });

  test("the database refuses a fixed activity with a year and an annual review that is not fixed", async () => {
    const set = await createSet();
    // PrismaPromise is lazy: wrap it so the insert actually runs.
    const insert = (overrides: Record<string, unknown>) =>
      Promise.resolve(
        db.recurringActivity.create({
          data: {
            organizationId,
            scheduleSetId: set.id,
            weekday: 1,
            start: "10:00",
            ...overrides,
          },
        }),
      );
    await expect(
      insert({ isFixed: true, year: FAR_FUTURE_YEAR }),
    ).rejects.toThrow();
    await expect(insert({ isFixed: false, year: null })).rejects.toThrow();
    await expect(
      insert({ isFixed: false, year: FAR_FUTURE_YEAR, annualReview: true }),
    ).rejects.toThrow();
  });

  test("the API refuses an annual review on an activity of a year", async () => {
    const set = await createSet();
    const res = await post(
      "activities",
      activityBody(set.id, { year: FAR_FUTURE_YEAR, annualReview: true }),
    );
    expect(res.status).toBe(400);
  });

  test("links ministries and refuses ones that are not the church's", async () => {
    const set = await createSet();
    const linked = await createActivity(set.id, { ministryIds: [ministryId] });
    expect(linked.ministryIds).toEqual([ministryId]);

    const res = await post(
      "activities",
      activityBody(set.id, { ministryIds: [crypto.randomUUID()] }),
    );
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_ministry");
  });

  test("a PATCH replaces the activity, audits it and respects the version", async () => {
    const set = await createSet();
    const activity = await createActivity(set.id);
    const body = {
      ...activityBody(set.id, { start: "18:00", end: null }),
      version: activity.version,
    };
    const res = await patch(`activities/${activity.id}`, body);
    expect(res.status).toBe(200);
    const after = (await res.json()) as RecurringActivityDto;
    expect(after.start).toBe("18:00");
    expect(after.version).toBe(activity.version + 1);
    const [row] = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "recurringActivity.updated",
    });
    expect(JSON.stringify(row?.before)).toContain("19:30");
    expect(JSON.stringify(row?.after)).toContain("18:00");

    const stale = await patch(`activities/${activity.id}`, {
      ...body,
      version: activity.version,
    });
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");
  });

  test("saving a copied activity from the CRM clears needsReview", async () => {
    const set = await createSet();
    const activity = await createActivity(set.id);
    await db.recurringActivity.update({
      where: { id: activity.id },
      data: { needsReview: true },
    });
    const res = await patch(`activities/${activity.id}`, {
      ...activityBody(set.id),
      version: activity.version,
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as RecurringActivityDto).needsReview).toBe(
      false,
    );
    const row = await db.recurringActivity.findUniqueOrThrow({
      where: { id: activity.id },
    });
    expect(row.needsReview).toBe(false);
  });

  test("lists by set and deletes logically", async () => {
    const set = await createSet();
    const other = await createSet();
    const activity = await createActivity(set.id);
    await createActivity(other.id);
    const list = (await (
      await get(`activities?scheduleSetId=${set.id}`)
    ).json()) as { items: RecurringActivityDto[] };
    expect(list.items.map((item) => item.id)).toEqual([activity.id]);

    expect((await del(`activities/${activity.id}`)).status).toBe(204);
    const after = (await (
      await get(`activities?scheduleSetId=${set.id}`)
    ).json()) as { items: RecurringActivityDto[] };
    expect(after.items).toEqual([]);
    expect((await del(`activities/${activity.id}`)).status).toBe(404);
  });
});

describe("schedule exceptions", () => {
  const body = (overrides: Record<string, unknown> = {}) => ({
    date: "2092-01-01",
    replacementSetId: null,
    translations: { es: { message: "Sin reunión (test)" } },
    ...overrides,
  });

  test("one exception per date, editable and deletable", async () => {
    const created = await post("exceptions", body());
    expect(created.status).toBe(201);
    const exception = (await created.json()) as ScheduleExceptionDto;
    createdExceptions.push(exception.id);
    expect(exception.replacementSetId).toBeNull();

    const duplicate = await post("exceptions", body());
    expect(duplicate.status).toBe(409);
    expect(await codeOf(duplicate)).toBe("exception_date_taken");

    const updated = await patch(`exceptions/${exception.id}`, {
      ...body({ translations: { es: { message: "Otro mensaje (test)" } } }),
      version: exception.version,
    });
    expect(updated.status).toBe(200);
    const stale = await patch(`exceptions/${exception.id}`, {
      ...body(),
      version: exception.version,
    });
    expect(stale.status).toBe(409);
    expect(await codeOf(stale)).toBe("stale_version");

    expect((await del(`exceptions/${exception.id}`)).status).toBe(204);
  });

  test("the replacement has to be a set of the church", async () => {
    const res = await post(
      "exceptions",
      body({ date: "2092-01-02", replacementSetId: crypto.randomUUID() }),
    );
    expect(res.status).toBe(400);
    expect(await codeOf(res)).toBe("invalid_schedule_set");
  });
});

describe("permissions", () => {
  test("viewing needs events:view, changing needs events:edit", async () => {
    expect((await get("places", viewerCookie)).status).toBe(200);
    expect((await get("places", nobodyCookie)).status).toBe(403);
    const forbidden = await post(
      "places",
      {
        address: null,
        mapsUrl: null,
        order: 0,
        translations: { es: { name: "No" } },
      },
      viewerCookie,
    );
    expect(forbidden.status).toBe(403);
    expect((await get("schedule-sets", nobodyCookie)).status).toBe(403);
    expect((await get("activities", nobodyCookie)).status).toBe(403);
    expect((await get("exceptions", nobodyCookie)).status).toBe(403);
  });
});
