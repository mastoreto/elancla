import type { Page } from "@playwright/test";
import { E2E_SITE_KEY_NAME, E2E_USERS, expect, login, test } from "./support";

const SITE_KEY_PATTERN = /^sk_[0-9a-f-]{36}_[\w-]+$/;
const LIMIT_MESSAGE = "Ya hay 2 claves activas. Revoca una antes de crear otra.";

/**
 * Frees the two slots except for the key the web server of this suite reads the API with
 * (seeded from .env.test): revoking it would turn the public site off for every other spec.
 */
async function revokeEveryActiveKeyButSeeded(page: Page): Promise<void> {
  const revokeButtons = page.getByRole("button", {
    name: new RegExp(`^Revocar (?!${E2E_SITE_KEY_NAME}$)`),
  });
  // Toasts are transient: the shrinking list of revoke buttons is what proves each revocation.
  for (let active = await revokeButtons.count(); active > 0; active -= 1) {
    await revokeButtons.first().click();
    await page.getByRole("button", { name: "Revocar", exact: true }).click();
    await expect(revokeButtons).toHaveCount(active - 1);
  }
}

/** Opens the dialog and submits a name; returns the dialog so the caller checks the outcome. */
async function submitNewKey(page: Page, name: string) {
  await page.getByRole("button", { name: "Crear clave" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre").fill(name);
  await dialog.getByRole("button", { name: "Crear clave" }).click();
  return dialog;
}

async function createKey(page: Page, name: string): Promise<string> {
  const dialog = await submitNewKey(page, name);
  await expect(dialog.getByText("Clave creada")).toBeVisible();
  const key = (await dialog.locator("code").textContent()) ?? "";
  await dialog.getByRole("button", { name: "Listo" }).click();
  await expect(page.getByText(name)).toBeVisible();
  return key;
}

test("an admin creates site keys, hits the two-key limit and revokes one", async ({ page }) => {
  await login(page, E2E_USERS.admin);
  await page.goto("/el-ancla/settings?tab=website");
  await expect(page.getByText("Claves del sitio")).toBeVisible();
  await revokeEveryActiveKeyButSeeded(page);

  const suffix = crypto.randomUUID().slice(0, 8);
  const first = `e2e web ${suffix} A`;
  const firstKey = await createKey(page, first);
  expect(firstKey).toMatch(SITE_KEY_PATTERN);
  // Shown once: after closing the dialog the secret is nowhere on the page.
  await expect(page.getByText(firstKey)).toHaveCount(0);

  // The seeded key holds the other slot, so the limit is already reached.
  await expect(page.getByText(E2E_SITE_KEY_NAME)).toBeVisible();
  const third = await submitNewKey(page, `e2e web ${suffix} B`);
  await expect(third.getByText(LIMIT_MESSAGE)).toBeVisible();
  await third.getByRole("button", { name: "Cancelar" }).click();

  await page.getByRole("button", { name: `Revocar ${first}` }).click();
  await page.getByRole("button", { name: "Revocar", exact: true }).click();
  await expect(page.getByText("Clave revocada")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: first })).toContainText("Revocada");

  // The revoked key no longer reads the public API.
  const response = await page.request.get("/api/public/v1/el-ancla/settings", {
    headers: { Authorization: `Bearer ${firstKey}` },
  });
  expect(response.status()).toBe(401);

  // The seeded key was left alone and still reads it.
  await expect(page.getByRole("listitem").filter({ hasText: E2E_SITE_KEY_NAME })).not.toContainText(
    "Revocada",
  );
});

test("a treasurer does not see the website tab", async ({ page }) => {
  await login(page, E2E_USERS.treasurer);
  await page.goto("/el-ancla/settings?tab=website");
  await expect(page.getByRole("tab", { name: "Sitio web" })).toHaveCount(0);
});
