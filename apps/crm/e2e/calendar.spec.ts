import type { Browser, Page } from "@playwright/test";
import { clientAddressHeaders, E2E_USERS, expect, login, test, WEB_URL } from "./support";

const CALENDAR_ROUTE = "/el-ancla/calendar";
const SCHEDULE_ROUTE = `${CALENDAR_ROUTE}/schedule`;
const COPY_ROUTE = `${CALENDAR_ROUTE}/copy`;
const WEB_CALENDAR_ROUTE = "/calendario-anual";
const WEB_ICS_ROUTE = "/calendario-anual.ics";
const CHURCH_TIMEZONE = "America/Montevideo";
const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_CONFLICT = 409;
const WEB_POLL_TIMEOUT_MS = 20_000;
const TEST_TIMEOUT_MS = 120_000;
/** Far-away years nothing else uses: the first one still free is the copy target. */
const SPARE_YEARS = [2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099];

/** Every title carries the run id, so reruns never collide with earlier events. */
const RUN_ID = Date.now().toString(36);
const PUBLIC_TITLE = `E2E evento ${RUN_ID}`;
const INTERNAL_VISIBLE_TITLE = `E2E interno visible ${RUN_ID}`;
const INTERNAL_HIDDEN_TITLE = `E2E interno oculto ${RUN_ID}`;
const SUMMER_NAME = "Verano";
const SUMMER_WORSHIP = /10[:.]30/;
const REGULAR_WORSHIP = /11[:.]15/;

/** The year "today" falls in, in the church's own time zone (what the API calls the current year). */
function currentYear(): number {
  const year = new Intl.DateTimeFormat("en-CA", {
    timeZone: CHURCH_TIMEZONE,
    year: "numeric",
  }).format(new Date());
  return Number(year);
}

/** An API call made with the session of the page, the way the CRM's browser would. */
async function callApi(
  page: Page,
  method: "GET" | "POST" | "PUT",
  path: string,
  options: { data?: unknown; expectedStatus?: readonly number[] } = {},
): Promise<unknown> {
  const { data, expectedStatus = [HTTP_OK] } = options;
  const origin = new URL(page.url()).origin;
  const response = await page.request.fetch(`/api${path}`, {
    method,
    data,
    headers: { origin },
  });
  expect(expectedStatus, `${method} ${path} answered ${response.status()}`).toContain(
    response.status(),
  );
  return response.json().catch(() => null);
}

/** The year exists and is published (idempotent: both calls accept "already done"). */
async function ensurePublishedYear(page: Page, year: number): Promise<void> {
  await callApi(page, "POST", "/content/calendar/years", {
    data: { year },
    expectedStatus: [HTTP_CREATED, HTTP_CONFLICT],
  });
  await callApi(page, "POST", `/content/calendar/years/${year}/publish`, {
    expectedStatus: [HTTP_OK, HTTP_CONFLICT],
  });
}

async function webText(page: Page, route: string): Promise<string> {
  return (await page.request.get(`${WEB_URL}${route}`)).text();
}

async function pollWebFor(page: Page, route: string, expected: string | RegExp): Promise<void> {
  await expect
    .poll(
      async () => {
        const text = await webText(page, route);
        return typeof expected === "string" ? text.includes(expected) : expected.test(text);
      },
      { timeout: WEB_POLL_TIMEOUT_MS },
    )
    .toBe(true);
}

/** The VEVENT of the .ics that carries `title` (empty when there is none). */
function eventBlockOf(ics: string, title: string): string {
  const blocks = ics.split("BEGIN:VEVENT").slice(1);
  return blocks.find((block) => block.includes(title)) ?? "";
}

async function pickOption(page: Page, trigger: string, name: string): Promise<void> {
  await page.locator(trigger).click();
  await page.getByRole("option", { name, exact: true }).click();
}

async function newContext(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const page = await context.newPage();
  await login(page, email);
  return page;
}

/** Creates a public event from the list and returns the URL of its editor. */
async function createEventFromList(page: Page, year: number): Promise<string> {
  await page.goto(`${CALENDAR_ROUTE}?year=${year}`);
  await page.getByTestId("new-event-button").click();
  await page.getByTestId("new-event-create").click();
  await expect(page).toHaveURL(new RegExp(`${CALENDAR_ROUTE}/events/[0-9a-f-]{36}`));
  return page.url();
}

async function fillEvent(page: Page, title: string, date: string): Promise<void> {
  await page.getByTestId("event-title").fill(title);
  await page.getByTestId("event-start-date").fill(date);
  await page.getByTestId("event-save-draft").click();
  await expect(page.getByText("Borrador guardado")).toBeVisible();
}

/** The editorial bar saves what the form holds and then publishes. */
async function publishEvent(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText("Contenido publicado")).toBeVisible();
}

/** An internal event created and drafted by API, visible only to the roles in `audienceRoleIds`. */
async function createInternalEvent(
  page: Page,
  input: { year: number; title: string; audienceRoleIds: string[] },
): Promise<string> {
  const created = (await callApi(page, "POST", "/content/calendar/events", {
    data: { year: input.year, visibility: "internal", audienceRoleIds: input.audienceRoleIds },
    expectedStatus: [HTTP_CREATED],
  })) as { id: string };
  await callApi(page, "PUT", `/editorial/event/${created.id}/draft`, {
    data: {
      snapshot: {
        translations: { es: { title: input.title } },
        startDate: `${input.year}-10-10`,
        allDay: false,
        placeMode: "tbc",
        ministryIds: [],
        status: "scheduled",
      },
    },
  });
  return created.id;
}

async function roleIdByKey(page: Page, key: string): Promise<string> {
  const roles = (await callApi(page, "GET", "/roles")) as { id: string; key: string | null }[];
  const role = roles.find((item) => item.key === key);
  if (!role) throw new Error(`The seeded role ${key} was not found`);
  return role.id;
}

function summerRow(page: Page) {
  return page
    .getByTestId(/^schedule-set-row-[0-9a-f-]{36}$/)
    .filter({ hasText: SUMMER_NAME })
    .first();
}

async function setSummerForced(page: Page, forced: boolean): Promise<void> {
  await page.goto(SCHEDULE_ROUTE);
  const toggle = summerRow(page).getByRole("switch", { name: "Forzar este horario" });
  if ((await toggle.getAttribute("aria-checked")) === String(forced)) return;
  await toggle.click();
  await expect(page.getByText(forced ? "Horario forzado" : "Horario ya no forzado")).toBeVisible();
}

test.describe.configure({ mode: "serial", timeout: TEST_TIMEOUT_MS });

test("the admin publishes a public event that shows on the web and in the .ics, then cancels it", async ({
  page,
}) => {
  const year = currentYear();
  await login(page, E2E_USERS.admin);
  await ensurePublishedYear(page, year);

  const editorUrl = await createEventFromList(page, year);
  await fillEvent(page, PUBLIC_TITLE, `${year}-09-19`);
  await publishEvent(page);

  await pollWebFor(page, WEB_CALENDAR_ROUTE, PUBLIC_TITLE);
  await pollWebFor(page, WEB_ICS_ROUTE, PUBLIC_TITLE);
  // Earlier runs leave cancelled events in the same database: look only at this run's event.
  expect(eventBlockOf(await webText(page, WEB_ICS_ROUTE), PUBLIC_TITLE)).not.toContain(
    "STATUS:CANCELLED",
  );

  // Cancelling goes through the same editorial flow: the .ics says so with the same UID.
  await page.goto(editorUrl);
  await pickOption(page, "#event-status", "Cancelado");
  await page.getByTestId("event-save-draft").click();
  await expect(page.getByText("Borrador guardado")).toBeVisible();
  await publishEvent(page);
  await expect
    .poll(async () => eventBlockOf(await webText(page, WEB_ICS_ROUTE), PUBLIC_TITLE), {
      timeout: WEB_POLL_TIMEOUT_MS,
    })
    .toContain("STATUS:CANCELLED");
});

test("forcing the summer schedule changes the worship time on the landing and the visit page", async ({
  page,
}) => {
  await login(page, E2E_USERS.admin);
  await setSummerForced(page, false);
  await pollWebFor(page, "/", REGULAR_WORSHIP);

  try {
    await setSummerForced(page, true);
    await pollWebFor(page, "/", SUMMER_WORSHIP);
    await pollWebFor(page, "/visitanos", SUMMER_WORSHIP);
  } finally {
    // The other specs expect the regular schedule: switch the manual override off again.
    await setSummerForced(page, false);
  }
  await pollWebFor(page, "/", REGULAR_WORSHIP);
});

test("the admin creates a year, copies a selection of the current one and publishes it", async ({
  page,
}) => {
  const sourceYear = currentYear();
  await login(page, E2E_USERS.admin);
  await ensurePublishedYear(page, sourceYear);

  const existing = (await callApi(page, "GET", "/content/calendar/years")) as {
    items: { year: number }[];
  };
  const taken = new Set(existing.items.map((item) => item.year));
  const targetYear = SPARE_YEARS.find((year) => !taken.has(year));
  if (targetYear === undefined)
    throw new Error("No spare calendar year is left in the test database");

  await page.goto(CALENDAR_ROUTE);
  await page.getByTestId("create-year-button").first().click();
  await page.locator("#create-year-number").fill(String(targetYear));
  await page.getByTestId("create-year-submit").click();
  await expect(page.getByText(`Año ${targetYear} creado como borrador.`)).toBeVisible();

  await page.goto(`${COPY_ROUTE}?from=${sourceYear}&to=${targetYear}`);
  await page
    .getByTestId(/^copy-item-/)
    .filter({ hasText: PUBLIC_TITLE })
    .click();
  await page.getByTestId("copy-submit").click();
  await expect(page.getByTestId("copy-done")).toBeVisible();

  // The copy is a draft marked "a revisar" until the year goes live.
  await page.goto(`${CALENDAR_ROUTE}?year=${targetYear}`);
  const copied = page.getByTestId("event-row").filter({ hasText: PUBLIC_TITLE });
  await expect(copied).toHaveCount(1);
  await expect(copied).toContainText("A revisar");
  await expect(page.getByTestId("year-status")).toHaveText("Borrador");

  await page.getByTestId("publish-year-button").click();
  await page.getByRole("dialog").getByRole("button", { name: "Publicar año" }).click();
  await expect(page.getByTestId("year-status")).toHaveText("Publicado");
  await expect(page.getByTestId("event-row").filter({ hasText: PUBLIC_TITLE })).toContainText(
    "En el sitio",
  );
});

test("an internal event is only visible to the roles of its audience", async ({
  page,
  browser,
}) => {
  const year = currentYear();
  await login(page, E2E_USERS.admin);
  const editorRoleId = await roleIdByKey(page, "content-editor");
  const leaderRoleId = await roleIdByKey(page, "leader");
  await createInternalEvent(page, {
    year,
    title: INTERNAL_VISIBLE_TITLE,
    audienceRoleIds: [editorRoleId],
  });
  const hiddenId = await createInternalEvent(page, {
    year,
    title: INTERNAL_HIDDEN_TITLE,
    audienceRoleIds: [leaderRoleId],
  });

  // The admin sees both.
  await page.goto(`${CALENDAR_ROUTE}?year=${year}`);
  await expect(page.getByText(INTERNAL_VISIBLE_TITLE)).toBeVisible();
  await expect(page.getByText(INTERNAL_HIDDEN_TITLE)).toBeVisible();

  // The editor is in the audience of one: the other is not in the list nor reachable by URL.
  const editorPage = await newContext(browser, E2E_USERS.editor);
  await editorPage.goto(`${CALENDAR_ROUTE}?year=${year}`);
  await expect(editorPage.getByText(INTERNAL_VISIBLE_TITLE)).toBeVisible();
  await expect(editorPage.getByText(INTERNAL_HIDDEN_TITLE)).toHaveCount(0);
  const hidden = await editorPage.goto(`${CALENDAR_ROUTE}/events/${hiddenId}?year=${year}`);
  expect(hidden?.status()).toBe(404);
  await editorPage.context().close();

  // Neither appears on the public site.
  const publicHtml = await webText(page, WEB_CALENDAR_ROUTE);
  expect(publicHtml).not.toContain(INTERNAL_VISIBLE_TITLE);
  expect(publicHtml).not.toContain(INTERNAL_HIDDEN_TITLE);
});
