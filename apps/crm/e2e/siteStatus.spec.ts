import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { clientAddressHeaders, E2E_USERS, expect, login, test, WEB_URL } from "./support";

const WEBSITE_PAGE = "/el-ancla/website";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const SERVICE_TIMES_ID = "horarios";
const RETRY_AFTER_SECONDS = "300";
// Set to a directory to keep screenshots of every state (used to compare against the design).
const SCREENSHOT_DIR = process.env.E2E_SCREENSHOT_DIR;

const BLOG_ROUTE = "/blog";
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_UNAVAILABLE = 503;
const WEB_POLL_TIMEOUT_MS = 15_000;

type SiteStatusLabel = "En línea" | "Mantenimiento" | "Cerrado";
type SectionStatusLabel = "Activa" | "Mantenimiento" | "Fuera de servicio";

/**
 * Picks a status in the CRM with the real controls and proves it was saved: the confirmation toast
 * shows, the button leaves its pending (disabled) state and the choice survives a reload.
 */
async function chooseSiteStatus(page: Page, label: SiteStatusLabel): Promise<void> {
  await page.goto(WEBSITE_PAGE);
  const option = page.getByRole("button", { name: new RegExp(`^${label}`) });
  await expect(option).toBeVisible();
  if ((await option.getAttribute("aria-pressed")) !== "true") {
    await option.click();
    await expect(page.getByText("Estado del sitio actualizado")).toBeVisible();
    await expect(option).toHaveAttribute("aria-pressed", "true");
    await expect(option).toBeEnabled();
  }
  await page.reload();
  await expect(page.getByRole("button", { name: new RegExp(`^${label}`) })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
}

/** The web caches the settings for a moment (SITE_CONFIG_TTL_MS): wait until it serves `status`. */
async function waitForWebStatus(page: Page, expected: number, route = "/"): Promise<void> {
  await expect
    .poll(async () => (await page.request.get(`${WEB_URL}${route}`)).status(), {
      timeout: WEB_POLL_TIMEOUT_MS,
    })
    .toBe(expected);
}

/**
 * Sets the status of one section with the real controls of the "Secciones del sitio" card and
 * proves it was saved: the toast shows and the choice survives a reload.
 */
async function chooseSectionStatus(
  page: Page,
  section: string,
  label: SectionStatusLabel,
): Promise<void> {
  await page.goto(WEBSITE_PAGE);
  const card = page.locator("section", {
    has: page.getByRole("heading", { name: "Secciones del sitio" }),
  });
  const select = card.getByRole("combobox", { name: section });
  await expect(select).toBeVisible();
  if (!(await select.innerText()).includes(label)) {
    await select.click();
    await page.getByRole("option", { name: label }).click();
    await card.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Secciones actualizadas")).toBeVisible();
  }
  await page.reload();
  await expect(card.getByRole("combobox", { name: section })).toContainText(label);
}

async function captureState(page: Page, name: string): Promise<void> {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  // The entrance animations take a few seconds to settle.
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`) });
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("the public site follows the status chosen in the CRM", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await login(page, E2E_USERS.admin);
  });

  // Whatever happens, leave the site online: the other specs (and the next run) expect it.
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
    const page = await context.newPage();
    await login(page, E2E_USERS.admin);
    await chooseSiteStatus(page, "En línea");
    await chooseSectionStatus(page, "Blog", "Activa");
    await context.close();
  });

  test("Mantenimiento shows the maintenance screen as a 503 on every page", async ({ page }) => {
    await chooseSiteStatus(page, "Mantenimiento");
    await waitForWebStatus(page, 503);

    for (const route of ["/", "/visitanos"]) {
      const response = await page.request.get(`${WEB_URL}${route}`);
      expect(response.status()).toBe(503);
      expect(response.headers()["retry-after"]).toBe(RETRY_AFTER_SECONDS);
      expect(response.headers()["x-robots-tag"]).toBe("noindex");
    }

    await page.setViewportSize(DESKTOP);
    await page.goto(`${WEB_URL}/visitanos`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sitio en mantenimiento.");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("main")).toHaveCount(0);
    await captureState(page, "maintenance-desktop");

    const contact = page.getByRole("link", { name: "Escribir por correo" });
    await expect(contact).toHaveAttribute("href", /^mailto:[^@\s]+@[^@\s]+$/);

    // "Ver horarios de culto" jumps to the service times and highlights them.
    const services = page.locator(`#${SERVICE_TIMES_ID}`);
    await page.getByRole("link", { name: "Ver horarios de culto" }).click();
    await expect(page).toHaveURL(new RegExp(`#${SERVICE_TIMES_ID}$`));
    await expect(services).toBeInViewport();
    await expect(services).toContainText(/\d{1,2}:\d{2}/);
    expect(await page.evaluate(() => document.querySelector(":target")?.id)).toBe(SERVICE_TIMES_ID);
  });

  test("Mantenimiento fits a phone", async ({ page }) => {
    await chooseSiteStatus(page, "Mantenimiento");
    await waitForWebStatus(page, 503);
    await page.setViewportSize(MOBILE);
    await page.goto(WEB_URL);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sitio en mantenimiento.");
    await expect(page.getByRole("link", { name: "Ver horarios de culto" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Escribir por correo" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await captureState(page, "maintenance-mobile");
  });

  test("Cerrado shows the offline screen and Reintentar reloads the page", async ({ page }) => {
    await chooseSiteStatus(page, "Cerrado");
    await waitForWebStatus(page, 503);

    await page.setViewportSize(DESKTOP);
    await page.goto(`${WEB_URL}/visitanos`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fuera de línea.");
    await expect(page.getByRole("link", { name: "Escribir por correo" })).toHaveCount(0);
    await captureState(page, "closed-desktop");

    await page.evaluate(() => {
      (window as unknown as { visitMarker: boolean }).visitMarker = true;
    });
    const reload = page.waitForRequest((request) => request.url() === `${WEB_URL}/visitanos`);
    await page.getByRole("link", { name: "Reintentar" }).click();
    await reload;
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fuera de línea.");
    // A real reload starts a fresh document: the marker set before the click is gone.
    expect(
      await page.evaluate(() => (window as unknown as { visitMarker?: boolean }).visitMarker),
    ).toBeUndefined();
  });

  test("Cerrado fits a phone", async ({ page }) => {
    await chooseSiteStatus(page, "Cerrado");
    await waitForWebStatus(page, 503);
    await page.setViewportSize(MOBILE);
    await page.goto(WEB_URL);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fuera de línea.");
    await expect(page.getByRole("link", { name: "Reintentar" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await captureState(page, "closed-mobile");
  });

  test("En línea brings the normal site back", async ({ page }) => {
    await chooseSiteStatus(page, "En línea");
    await waitForWebStatus(page, 200);

    await page.goto(WEB_URL);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Una iglesia con ancla");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    expect((await page.request.get(`${WEB_URL}/visitanos`)).status()).toBe(200);
  });
  test("a section in Mantenimiento answers 503 on its own and leaves the home up", async ({
    page,
  }) => {
    await chooseSiteStatus(page, "En línea");
    await chooseSectionStatus(page, "Blog", "Mantenimiento");
    await waitForWebStatus(page, HTTP_UNAVAILABLE, BLOG_ROUTE);

    await page.setViewportSize(DESKTOP);
    await page.goto(`${WEB_URL}${BLOG_ROUTE}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Esta sección está en mantenimiento",
    );
    expect((await page.request.get(`${WEB_URL}/`)).status()).toBe(HTTP_OK);
  });

  test("a section Fuera de servicio is a 404 and leaves the navigation", async ({ page }) => {
    await chooseSiteStatus(page, "En línea");
    await chooseSectionStatus(page, "Blog", "Fuera de servicio");
    await waitForWebStatus(page, HTTP_NOT_FOUND, BLOG_ROUTE);

    await page.setViewportSize(DESKTOP);
    await page.goto(WEB_URL);
    await expect(page.locator('nav a[href$="/blog"]')).toHaveCount(0);
    expect((await page.request.get(`${WEB_URL}/`)).status()).toBe(HTTP_OK);
  });

  test("Activa brings the section back", async ({ page }) => {
    await chooseSectionStatus(page, "Blog", "Activa");
    await waitForWebStatus(page, HTTP_OK, BLOG_ROUTE);
  });
});
