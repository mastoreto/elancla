import type { Page } from "@playwright/test";
import { E2E_USERS, expect, login, test, WEB_URL } from "./support";

const WEBSITE_PAGE = "/el-ancla/website";
const VISIT_ROUTE = "/visitanos";
const FIRST_SERVICE_START = "#service-start-0";
const CHANGED_WORSHIP_START = "11:45";
const WEB_POLL_TIMEOUT_MS = 15_000;

/** Types a new start time in the first row of the "Horarios de reunión" card and saves it. */
async function setFirstServiceStart(page: Page, start: string): Promise<void> {
  await page.goto(WEBSITE_PAGE);
  const input = page.locator(FIRST_SERVICE_START);
  await expect(input).toBeVisible();
  await input.fill(start);
  const card = page.locator("section", {
    has: page.getByRole("heading", { name: "Horarios de reunión" }),
  });
  await card.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Horarios actualizados")).toBeVisible();
}

async function readFirstServiceStart(page: Page): Promise<string> {
  await page.goto(WEBSITE_PAGE);
  const input = page.locator(FIRST_SERVICE_START);
  await expect(input).toBeVisible();
  return input.inputValue();
}

/** The web caches the settings for a moment (SITE_CONFIG_TTL_MS): poll until the page shows `text`. */
async function waitForVisitText(page: Page, text: string): Promise<void> {
  await expect
    .poll(async () => (await page.request.get(`${WEB_URL}${VISIT_ROUTE}`)).text(), {
      timeout: WEB_POLL_TIMEOUT_MS,
    })
    .toContain(text);
}

test.describe("the generated visit FAQ follows the schedule edited in the CRM", () => {
  test("changing the worship time changes the generated answer", async ({ page }) => {
    await login(page, E2E_USERS.admin);
    const originalStart = await readFirstServiceStart(page);
    try {
      await setFirstServiceStart(page, CHANGED_WORSHIP_START);
      await waitForVisitText(page, `Los domingos a las ${CHANGED_WORSHIP_START}`);
    } finally {
      await setFirstServiceStart(page, originalStart);
    }
    await waitForVisitText(page, `Los domingos a las ${originalStart}`);
  });
});
