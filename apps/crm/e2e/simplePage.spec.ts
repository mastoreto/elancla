import type { Page } from "@playwright/test";
import { E2E_USERS, expect, login, test, WEB_URL } from "./support";

const PAGES_ROUTE = "/el-ancla/website/pages";
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const WEB_POLL_TIMEOUT_MS = 15_000;

/** The slug carries the run id, so reruns never collide with the pages an earlier run left paused. */
const RUN_ID = Date.now().toString(36);
const PAGE_TITLE = `Pagina e2e ${RUN_ID}`;
const PAGE_SLUG = `pagina-e2e-${RUN_ID}`;
const PAGE_BODY = `Contenido de prueba ${RUN_ID}`;

async function createPageAndFillSpanish(page: Page): Promise<void> {
  await page.goto(PAGES_ROUTE);
  await page.getByTestId("new-page-button").click();
  await expect(page).toHaveURL(new RegExp(`${PAGES_ROUTE}/[0-9a-f-]{36}$`));

  await page.getByTestId("page-title").fill(PAGE_TITLE);
  // The slug follows the title until it is edited by hand.
  await expect(page.getByTestId("page-slug")).toHaveValue(PAGE_SLUG);
  await page.getByTestId("page-slug").fill(PAGE_SLUG);
  await page.getByTestId("page-body").locator(".ProseMirror").fill(PAGE_BODY);

  await page.getByTestId("page-save-draft").click();
  await expect(page.getByText("Borrador guardado")).toBeVisible();
}

async function webStatus(page: Page, route: string): Promise<number> {
  return (await page.request.get(`${WEB_URL}${route}`)).status();
}

/** The web caches pages for a moment (SITE_CONFIG_TTL_MS): poll until the route answers `status`. */
async function waitForWebStatus(page: Page, route: string, status: number): Promise<void> {
  await expect.poll(() => webStatus(page, route), { timeout: WEB_POLL_TIMEOUT_MS }).toBe(status);
}

test("a published simple page shows on the web and in the footer, and pausing hides it", async ({
  page,
}) => {
  await login(page, E2E_USERS.admin);
  await createPageAndFillSpanish(page);

  // Publishing straight away: the admin needs no review.
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Contenido publicado")).toBeVisible();

  await waitForWebStatus(page, `/${PAGE_SLUG}`, HTTP_OK);
  const published = await (await page.request.get(`${WEB_URL}/${PAGE_SLUG}`)).text();
  expect(published).toContain(PAGE_TITLE);
  expect(published).toContain(PAGE_BODY);

  await expect
    .poll(async () => (await page.request.get(`${WEB_URL}/`)).text(), {
      timeout: WEB_POLL_TIMEOUT_MS,
    })
    .toContain(`href="/${PAGE_SLUG}"`);

  // Pausing takes it off the web (the content stays in the CRM).
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByText("Contenido pausado")).toBeVisible();
  await waitForWebStatus(page, `/${PAGE_SLUG}`, HTTP_NOT_FOUND);
});
