import type { Browser, Page } from "@playwright/test";
import { clientAddressHeaders, E2E_USERS, expect, login, test, WEB_URL } from "./support";

const MINISTRIES_ROUTE = "/el-ancla/ministries";
const CATEGORIES_ROUTE = `${MINISTRIES_ROUTE}/categories`;
const LANDING_ROUTE = `${MINISTRIES_ROUTE}/landing`;
const PEOPLE_NEW_ROUTE = "/el-ancla/website/people/new";
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_CREATED = 201;
const WEB_POLL_TIMEOUT_MS = 20_000;
const TEST_TIMEOUT_MS = 120_000;
const USERS_PAGE_LIMIT = 100;

/** Every name and slug carries the run id, so reruns never collide with earlier ministries. */
const RUN_ID = Date.now().toString(36);
const CATEGORY_NAME = `Categoria e2e ${RUN_ID}`;
const LEADER_NAME = `Lider e2e ${RUN_ID}`;
const LEADER_TITLE = "Coordinador general";

interface MinistryDraft {
  /** Internal name (what users and invitations see). */
  internalName: string;
  /** Public name and slug of the Spanish profile. */
  name: string;
  slug: string;
}

function draftOf(label: string): MinistryDraft {
  return {
    internalName: `Ministerio ${label} ${RUN_ID}`,
    name: `Ministerio ${label} ${RUN_ID}`,
    slug: `ministerio-${label}-${RUN_ID}`,
  };
}

/** An API call made with the session of the page, the way the CRM's browser would. */
async function callApi(
  page: Page,
  method: "GET" | "POST" | "PUT",
  path: string,
  options: { data?: unknown; expectedStatus?: number } = {},
): Promise<unknown> {
  const { data, expectedStatus = HTTP_OK } = options;
  const origin = new URL(page.url()).origin;
  const response = await page.request.fetch(`/api${path}`, {
    method,
    data,
    headers: { origin },
  });
  expect(response.status(), `${method} ${path}`).toBe(expectedStatus);
  return response.json();
}

async function pickOption(page: Page, trigger: string, name: string): Promise<void> {
  await page.locator(trigger).click();
  await page.getByRole("option", { name, exact: true }).click();
}

async function webText(page: Page, route: string): Promise<string> {
  return (await page.request.get(`${WEB_URL}${route}`)).text();
}

async function webStatus(page: Page, route: string): Promise<number> {
  return (await page.request.get(`${WEB_URL}${route}`)).status();
}

/** The web caches for a moment (SITE_CONFIG_TTL_MS): poll until the ministry page answers. */
async function waitForMinistryPage(page: Page, slug: string): Promise<string> {
  await expect
    .poll(() => webStatus(page, `/ministerios/${slug}`), { timeout: WEB_POLL_TIMEOUT_MS })
    .toBe(HTTP_OK);
  return webText(page, `/ministerios/${slug}`);
}

async function createCategory(page: Page): Promise<void> {
  await page.goto(CATEGORIES_ROUTE);
  await page.getByTestId("ministry-category-new").click();
  await page.getByTestId("ministry-category-name").fill(CATEGORY_NAME);
  await page.getByTestId("ministry-category-save").click();
  await expect(page.getByText("Categoría creada")).toBeVisible();
}

async function createPerson(page: Page): Promise<void> {
  await page.goto(PEOPLE_NEW_ROUTE);
  await page.locator("#person-name").fill(LEADER_NAME);
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page).toHaveURL(/\/website\/people$/);
}

/** Creates a ministry from the list and opens its edit page. Resolves to the page's URL. */
async function createMinistryFromList(page: Page, draft: MinistryDraft): Promise<string> {
  await page.goto(MINISTRIES_ROUTE);
  await page.getByTestId("new-ministry-button").click();
  await page.getByTestId("new-ministry-name").fill(draft.internalName);
  await page.getByTestId("new-ministry-create").click();
  await expect(page).toHaveURL(new RegExp(`${MINISTRIES_ROUTE}/[0-9a-f-]{36}$`));
  return page.url();
}

/** Fills the Spanish profile and saves it as a draft. */
async function fillProfile(page: Page, draft: MinistryDraft): Promise<void> {
  await page.getByTestId("ministry-name").fill(draft.name);
  // The slug follows the name until it is edited by hand.
  await page.getByTestId("ministry-slug").fill(draft.slug);
  await page.getByTestId("ministry-tagline").fill("Una frase de prueba");
  await page.getByTestId("ministry-about").locator(".ProseMirror").fill(`Sobre ${RUN_ID}`);
  await page.getByTestId("ministry-save-draft").click();
  await expect(page.getByText("Borrador guardado")).toBeVisible();
}

async function configureMinistry(page: Page): Promise<void> {
  await pickOption(page, "#ministry-category", CATEGORY_NAME);
  await pickOption(page, "#ministry-icon", "Alabanza");
  await pickOption(page, "#ministry-color", "Rojo");
  await page.getByTestId("ministry-settings-save").click();
  await expect(page.getByText("Configuración guardada")).toBeVisible();
}

async function addVisibleLeader(page: Page): Promise<void> {
  await page.getByTestId("ministry-leader-add").click();
  await pickOption(page, "#ministry-leader-person-0", LEADER_NAME);
  await page.locator("#ministry-leader-title-0").fill(LEADER_TITLE);
  await page.getByRole("switch", { name: "Visible en el sitio" }).click();
  await page.getByTestId("ministry-leaders-save").click();
  await expect(page.getByText("Responsables guardados")).toBeVisible();
}

async function showOnLanding(page: Page, ministryId: string): Promise<void> {
  await page.goto(LANDING_ROUTE);
  const row = page.getByTestId(`landing-row-${ministryId}`);
  await row.getByRole("switch", { name: "Mostrar en la landing" }).click();
  await page.getByTestId("landing-save").click();
  await expect(page.getByText("Mosaico guardado")).toBeVisible();
}

async function newContext(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const page = await context.newPage();
  await login(page, email);
  return page;
}

/** Assigns the ministry to the seeded leader: a leader's scope comes from its ministries. */
async function assignLeaderUser(adminPage: Page, ministryId: string): Promise<void> {
  const users = (await callApi(adminPage, "GET", `/users?limit=${USERS_PAGE_LIMIT}`)) as {
    items: { id: string; email: string }[];
  };
  const leader = users.items.find((user) => user.email === E2E_USERS.leader);
  if (!leader) throw new Error(`The seeded user ${E2E_USERS.leader} was not found`);
  await callApi(adminPage, "PUT", `/users/${leader.id}/ministries`, {
    data: { ministryIds: [ministryId] },
  });
}

test.describe.configure({ mode: "serial", timeout: TEST_TIMEOUT_MS });

test("the admin creates, configures and publishes a ministry that shows on the web, joins the mosaic and is paused", async ({
  page,
}) => {
  await login(page, E2E_USERS.admin);
  await createCategory(page);
  await createPerson(page);

  const draft = draftOf("admin");
  const ministryUrl = await createMinistryFromList(page, draft);
  const ministryId = ministryUrl.split("/").pop() as string;
  await fillProfile(page, draft);
  await configureMinistry(page);
  await addVisibleLeader(page);

  // The admin needs no review: publishing goes straight through.
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Contenido publicado")).toBeVisible();

  const detail = await waitForMinistryPage(page, draft.slug);
  expect(detail).toContain(draft.name);
  expect(detail).toContain(LEADER_NAME);
  expect(detail).toContain(LEADER_TITLE);

  // Joining the mosaic puts its link on the landing.
  await showOnLanding(page, ministryId);
  await expect
    .poll(async () => (await webText(page, "/")).includes(`/ministerios/${draft.slug}`), {
      timeout: WEB_POLL_TIMEOUT_MS,
    })
    .toBe(true);

  // Pausing takes it off the web (the content stays in the CRM).
  await page.goto(ministryUrl);
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByText("Contenido pausado")).toBeVisible();
  await expect
    .poll(() => webStatus(page, `/ministerios/${draft.slug}`), { timeout: WEB_POLL_TIMEOUT_MS })
    .toBe(HTTP_NOT_FOUND);
});

test("a leader edits only the profile of their ministry and sends it to review; the admin's approval publishes it", async ({
  page,
  browser,
}) => {
  await login(page, E2E_USERS.admin);
  const draft = draftOf("lider");
  const created = (await callApi(page, "POST", "/content/ministries", {
    data: { name: draft.internalName },
    expectedStatus: HTTP_CREATED,
  })) as { id: string };
  await assignLeaderUser(page, created.id);
  const ministryUrl = `${MINISTRIES_ROUTE}/${created.id}`;

  const leaderPage = await newContext(browser, E2E_USERS.leader);
  await leaderPage.goto(MINISTRIES_ROUTE);
  // The list holds the ministry the leader belongs to, and offers no way to create another.
  await expect(leaderPage.getByTestId("ministry-row")).toHaveCount(1);
  await expect(leaderPage.getByTestId("new-ministry-button")).toHaveCount(0);

  await leaderPage.goto(ministryUrl);
  await fillProfile(leaderPage, draft);
  // No "Publicar", and the settings of the ministry are not theirs to touch.
  await expect(leaderPage.getByRole("button", { name: "Publicar" })).toHaveCount(0);
  await expect(leaderPage.getByRole("heading", { name: "Configuración" })).toHaveCount(0);
  await expect(leaderPage.getByRole("heading", { name: "Responsables" })).toHaveCount(0);
  await leaderPage.getByRole("button", { name: "Enviar a revisión" }).click();
  await expect(leaderPage.getByText("Enviado a revisión")).toBeVisible();
  await leaderPage.context().close();
  expect(await webStatus(page, `/ministerios/${draft.slug}`)).toBe(HTTP_NOT_FOUND);

  // The admin approves it from the same screen and it shows up on the web.
  await page.goto(ministryUrl);
  await page.getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Contenido aprobado y publicado")).toBeVisible();
  expect(await waitForMinistryPage(page, draft.slug)).toContain(draft.name);
});
