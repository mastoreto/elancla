import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  type CalendarPendingDto,
  type CalendarReminderSettingsDto,
  grant,
  PERMISSIONS,
} from "@ancla/contracts";
import { db } from "@ancla/db";
import {
  createApiCaller,
  TEST_USER_AGENT,
} from "../../../test/support/apiCaller";
import { auditRowsOf, requestIdOf } from "../../../test/support/auditRows";
import { createFixtures } from "../../../test/support/fixtures";
import {
  createRecordingMailer,
  type RecordingMailer,
} from "../../../test/support/recordingMailer";
import { app } from "../../app";
import { getAuth } from "../../core/auth";
import { setMailerForTests } from "../../core/mail";
import { getStorageEnv } from "../../core/storage";
import { resolveOrganizationId } from "../../core/tenancy";
import { getCalendarPending } from "./useCases";

const fixtures = createFixtures();
const call = createApiCaller(fixtures);
const { CRON_SECRET } = getStorageEnv();

// The seed has 2026 published and 2027 as a draft; December 2026 targets 2027.
const TARGET_YEAR = 2027;
const SEASON_YEAR = 2026;
/** Midday in Montevideo (UTC-3), so the local date is the one in the name. */
const localNoon = (date: string): string => `${date}T15:00:00.000Z`;

let organizationId = "";
let editorCookie = "";
let viewerCookie = "";
let recipientId = "";
let recipientEmail = "";
let mailer: RecordingMailer = createRecordingMailer();
let settingsBefore: Awaited<
  ReturnType<typeof db.calendarReminderSettings.findUnique>
> = null;

beforeAll(async () => {
  organizationId = await resolveOrganizationId();
  settingsBefore = await db.calendarReminderSettings.findUnique({
    where: { organizationId },
  });
  const auth = getAuth();
  editorCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "reminders-editor", [
      grant(PERMISSIONS.events.view),
      grant(PERMISSIONS.events.edit),
    ]),
  );
  viewerCookie = await fixtures.signIn(
    auth,
    await fixtures.passwordUser(auth, "reminders-viewer", [
      grant(PERMISSIONS.events.view),
    ]),
  );
  recipientEmail = await fixtures.passwordUser(auth, "reminders-recipient", []);
  recipientId = (
    await db.user.findUniqueOrThrow({ where: { email: recipientEmail } })
  ).id;
});

afterAll(async () => {
  setMailerForTests(undefined);
  await db.calendarReminderSettings.deleteMany({ where: { organizationId } });
  if (settingsBefore) {
    await db.calendarReminderSettings.create({ data: settingsBefore });
  }
  await fixtures.cleanup();
});

const put = (body: unknown, cookie = editorCookie) =>
  call("PUT", "/content/calendar/reminders", { cookie, body });

const cron = (now?: string, bearer: string | null = CRON_SECRET) =>
  Promise.resolve(
    app.request(
      `/api/internal/calendar/reminders${now ? `?now=${encodeURIComponent(now)}` : ""}`,
      {
        headers: {
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          "X-Forwarded-For": fixtures.uniqueIp(),
          "User-Agent": TEST_USER_AGENT,
        },
      },
    ),
  );

const sentBy = async (date: string): Promise<number> => {
  const res = await cron(localNoon(date));
  expect(res.status).toBe(200);
  return ((await res.json()) as { sent: number }).sent;
};

describe("reminder recipients", () => {
  test("nobody configured reads as empty lists", async () => {
    await db.calendarReminderSettings.deleteMany({ where: { organizationId } });
    const res = await call("GET", "/content/calendar/reminders", {
      cookie: viewerCookie,
    });
    expect(res.status).toBe(200);
    expect((await res.json()) as CalendarReminderSettingsDto).toEqual({
      recipientRoleIds: [],
      recipientUserIds: [],
      lastSentOn: null,
    });
  });

  test("a PUT replaces the recipients and is audited", async () => {
    const res = await put({
      recipientRoleIds: [],
      recipientUserIds: [recipientId, recipientId],
    });
    expect(res.status).toBe(200);
    expect(
      ((await res.json()) as CalendarReminderSettingsDto).recipientUserIds,
    ).toEqual([recipientId]);
    const [row] = await auditRowsOf({
      requestId: requestIdOf(res),
      action: "calendarReminder.settingsUpdated",
    });
    expect(JSON.stringify(row?.after)).toContain(recipientId);
  });

  test("a role or user that does not exist is a 400", async () => {
    const role = await put({
      recipientRoleIds: [crypto.randomUUID()],
      recipientUserIds: [],
    });
    expect(role.status).toBe(400);
    expect(((await role.json()) as { code: string }).code).toBe("invalid_role");
    const user = await put({
      recipientRoleIds: [],
      recipientUserIds: [crypto.randomUUID()],
    });
    expect(user.status).toBe(400);
    expect(((await user.json()) as { code: string }).code).toBe("invalid_user");
  });

  test("viewing is not editing", async () => {
    const res = await put(
      { recipientRoleIds: [], recipientUserIds: [] },
      viewerCookie,
    );
    expect(res.status).toBe(403);
  });
});

describe("GET /api/internal/calendar/reminders", () => {
  beforeAll(async () => {
    await put({ recipientRoleIds: [], recipientUserIds: [recipientId] });
    await db.calendarReminderSettings.update({
      where: { organizationId },
      data: { lastSentOn: null },
    });
    mailer = createRecordingMailer();
    setMailerForTests(mailer);
  });

  test("401 without the cron secret or with a wrong one", async () => {
    expect((await cron(undefined, null)).status).toBe(401);
    expect((await cron(undefined, "nope")).status).toBe(401);
  });

  test("follows the cadence: not on 30/11, yes on 1/12, no on 2/12, yes on 3/12", async () => {
    expect(await sentBy(`${SEASON_YEAR}-11-30`)).toBe(0);
    expect(mailer.sent).toHaveLength(0);

    expect(await sentBy(`${SEASON_YEAR}-12-01`)).toBe(1);
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]?.to).toBe(recipientEmail);
    expect(mailer.sent[0]?.subject).toContain(String(TARGET_YEAR));
    const [audit] = await auditRowsOf({ action: "calendarReminder.sent" });
    expect(audit?.actorLabel).toBe("cron");
    expect(audit?.actorId).toBeNull();

    expect(await sentBy(`${SEASON_YEAR}-12-02`)).toBe(0);
    expect(await sentBy(`${SEASON_YEAR}-12-03`)).toBe(1);
  });

  test("it does not send twice on the same local day", async () => {
    const before = mailer.sent.length;
    expect(await sentBy(`${SEASON_YEAR}-12-03`)).toBe(0);
    expect(mailer.sent).toHaveLength(before);
  });

  test("with no recipients configured the admins take their place", async () => {
    await put({ recipientRoleIds: [], recipientUserIds: [] });
    await db.calendarReminderSettings.update({
      where: { organizationId },
      data: { lastSentOn: null },
    });
    const before = mailer.sent.length;
    const adminEmail = await fixtures.passwordUser(
      getAuth(),
      "reminders-admin",
      ["admin"],
    );
    expect(await sentBy(`${SEASON_YEAR}-12-05`)).toBeGreaterThanOrEqual(1);
    expect(mailer.sent.slice(before).map((message) => message.to)).toContain(
      adminEmail,
    );
  });

  test("it stops once the year is published and every review is confirmed", async () => {
    await put({ recipientRoleIds: [], recipientUserIds: [recipientId] });
    await db.calendarReminderSettings.update({
      where: { organizationId },
      data: { lastSentOn: null },
    });
    const yearBefore = await db.calendarYear.findFirstOrThrow({
      where: { organizationId, year: TARGET_YEAR },
    });
    const fixed = await db.recurringActivity.findMany({
      where: {
        organizationId,
        deletedAt: null,
        isFixed: true,
        annualReview: true,
      },
    });
    const confirmer = await db.user.findUniqueOrThrow({
      where: { email: recipientEmail },
    });
    try {
      await db.calendarYear.update({
        where: { id: yearBefore.id },
        data: { status: "PUBLISHED" },
      });
      await db.activityYearReview.createMany({
        data: fixed.map(({ id }) => ({
          activityId: id,
          year: TARGET_YEAR,
          confirmedById: confirmer.id,
        })),
      });
      const before = mailer.sent.length;
      expect(await sentBy(`${SEASON_YEAR}-12-07`)).toBe(0);
      expect(mailer.sent).toHaveLength(before);
    } finally {
      await db.activityYearReview.deleteMany({
        where: {
          year: TARGET_YEAR,
          activityId: { in: fixed.map(({ id }) => id) },
        },
      });
      await db.calendarYear.update({
        where: { id: yearBefore.id },
        data: {
          status: yearBefore.status,
          publishedAt: yearBefore.publishedAt,
        },
      });
    }
  });

  test("a bad simulated date is a 400", async () => {
    expect((await cron("tomorrow")).status).toBe(400);
  });
});

describe("the pending panel", () => {
  test("in December it is about the next year: a draft with the fixed reviews left", async () => {
    const pending = await getCalendarPending(
      organizationId,
      new Date(localNoon(`${SEASON_YEAR}-12-10`)),
    );
    expect(pending.year).toBe(TARGET_YEAR);
    expect(pending.yearStatus).toBe("draft");
    expect(pending.hasPending).toBe(true);
    expect(pending.pendingReviews.length).toBeGreaterThan(0);
  });

  test("the endpoint answers the same shape", async () => {
    const res = await call("GET", "/content/calendar/pending", {
      cookie: viewerCookie,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as CalendarPendingDto;
    expect(["missing", "draft", "published"]).toContain(body.yearStatus);
  });
});
