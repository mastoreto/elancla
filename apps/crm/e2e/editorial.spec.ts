import type { Page } from "@playwright/test";
import {
  clearMailTo,
  clientAddressHeaders,
  E2E_REVIEWER_NAME,
  E2E_USERS,
  expect,
  latestMailTo,
  login,
  test,
} from "./support";

const SETTINGS_URL = "/el-ancla/settings?tab=editorial";

/** An API call made with the session of the page, the way the CRM's browser would. */
async function callApi(
  page: Page,
  method: "PUT" | "POST",
  path: string,
  data?: unknown,
): Promise<void> {
  const origin = new URL(page.url()).origin;
  const response = await page.request.fetch(`/api${path}`, {
    method,
    data,
    headers: { origin },
  });
  expect(response.status(), `${method} ${path}`).toBe(200);
}

test("an editor's draft reaches the reviewer's bell and inbox mail", async ({ page, browser }) => {
  // 1. The admin makes the reviewer a reviewer of the blog, and it survives a reload.
  await login(page, E2E_USERS.admin);
  await page.goto(SETTINGS_URL);
  const blogCard = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Blog" }) });
  const reviewerBox = blogCard
    .getByRole("group", { name: "Personas revisoras", exact: true })
    .getByLabel(E2E_REVIEWER_NAME);
  await reviewerBox.check();
  await blogCard.getByRole("button", { name: "Guardar Blog" }).click();
  await expect(page.getByText("Revisión editorial guardada")).toBeVisible();
  await page.reload();
  await expect(reviewerBox).toBeChecked();

  // 2. The editor saves a draft and sends it to review.
  await clearMailTo(E2E_USERS.reviewer);
  const entityId = crypto.randomUUID();
  const editorContext = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const editorPage = await editorContext.newPage();
  await login(editorPage, E2E_USERS.editor);
  await callApi(editorPage, "PUT", `/editorial/blog-post/${entityId}/draft`, {
    snapshot: { title: "Entrada de prueba" },
  });
  await callApi(editorPage, "POST", `/editorial/blog-post/${entityId}/submit`);
  await editorContext.close();

  // The reviewer sees the dot on the bell and the item in the popover.
  const reviewerContext = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const reviewerPage = await reviewerContext.newPage();
  await login(reviewerPage, E2E_USERS.reviewer);
  await expect(reviewerPage.getByTestId("editorial-inbox-dot")).toBeVisible();
  await reviewerPage.getByRole("button", { name: "Notificaciones" }).click();
  await expect(reviewerPage.getByText("Para revisar")).toBeVisible();
  await expect(
    reviewerPage.getByRole("link", { name: /Entrada del blog/ }).first(),
  ).toHaveAttribute("href", "/blog");
  await reviewerContext.close();

  // 3. Mailpit received the "to review" email.
  const mail = await latestMailTo(E2E_USERS.reviewer);
  expect(mail).toContain("una entrada del blog");
  expect(mail).toContain("revisión");

  // Leave the inbox as found: the admin (a reviewer too) approves it.
  await callApi(page, "POST", `/editorial/blog-post/${entityId}/approve`);
});

test("someone with no editorial permission does not see the review tab", async ({ page }) => {
  await login(page, E2E_USERS.treasurer);
  await page.goto(SETTINGS_URL);
  await expect(page.getByRole("tab", { name: "Revisión editorial" })).toHaveCount(0);
});
