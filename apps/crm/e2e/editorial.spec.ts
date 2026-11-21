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
  expectedStatus = 200,
): Promise<{ id?: string }> {
  const origin = new URL(page.url()).origin;
  const response = await page.request.fetch(`/api${path}`, {
    method,
    data,
    headers: { origin },
  });
  expect(response.status(), `${method} ${path}`).toBe(expectedStatus);
  return expectedStatus === 201 ? ((await response.json()) as { id?: string }) : {};
}

/** The smallest profile a ministry accepts; the slug follows the entity so reruns never clash. */
function ministryProfile(entityId: string) {
  const name = "Perfil de prueba";
  return {
    translations: {
      es: {
        name,
        slug: `e2e-${entityId}`,
        tagline: "Una frase de prueba",
        about: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: name }] }],
        },
      },
    },
  };
}

test("an editor's draft reaches the reviewer's bell and inbox mail", async ({ page, browser }) => {
  // 1. The admin makes the reviewer a reviewer of the ministries, and it survives a reload.
  await login(page, E2E_USERS.admin);
  await page.goto(SETTINGS_URL);
  const blogCard = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Ministerios" }) });
  const reviewerBox = blogCard
    .getByRole("group", { name: "Personas revisoras", exact: true })
    .getByLabel(E2E_REVIEWER_NAME);
  await reviewerBox.check();
  await blogCard.getByRole("button", { name: "Guardar Ministerios" }).click();
  await expect(page.getByText("Revisión editorial guardada")).toBeVisible();
  await page.reload();
  await expect(reviewerBox).toBeChecked();

  // 2. The editor saves a draft and sends it to review.
  await clearMailTo(E2E_USERS.reviewer);
  // The ministry is a real row (the editorial type checks the entity exists): the admin creates it.
  const created = await callApi(
    page,
    "POST",
    "/content/ministries",
    { name: "Ministerio de prueba" },
    201,
  );
  const entityId = created.id as string;
  const editorContext = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const editorPage = await editorContext.newPage();
  await login(editorPage, E2E_USERS.editor);
  await callApi(editorPage, "PUT", `/editorial/ministry/${entityId}/draft`, {
    snapshot: ministryProfile(entityId),
  });
  await callApi(editorPage, "POST", `/editorial/ministry/${entityId}/submit`);
  await editorContext.close();

  // The reviewer sees the dot on the bell and the item in the popover.
  const reviewerContext = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const reviewerPage = await reviewerContext.newPage();
  await login(reviewerPage, E2E_USERS.reviewer);
  await expect(reviewerPage.getByTestId("editorial-inbox-dot")).toBeVisible();
  await reviewerPage.getByRole("button", { name: "Notificaciones" }).click();
  await expect(reviewerPage.getByText("Para revisar")).toBeVisible();
  await expect(
    reviewerPage.getByRole("link", { name: /Perfil de ministerio/ }).first(),
  ).toHaveAttribute("href", `/ministries/${entityId}`);
  await reviewerContext.close();

  // 3. Mailpit received the "to review" email.
  const mail = await latestMailTo(E2E_USERS.reviewer);
  expect(mail).toContain("el perfil de un ministerio");
  expect(mail).toContain("revisión");

  // Leave the inbox as found without publishing the test profile: the admin (a reviewer too)
  // sends it back.
  await callApi(page, "POST", `/editorial/ministry/${entityId}/request-changes`, {
    comment: "Prueba terminada",
  });
});

test("someone with no editorial permission does not see the review tab", async ({ page }) => {
  await login(page, E2E_USERS.treasurer);
  await page.goto(SETTINGS_URL);
  await expect(page.getByRole("tab", { name: "Revisión editorial" })).toHaveCount(0);
});
