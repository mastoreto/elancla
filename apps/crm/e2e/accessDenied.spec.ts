import { E2E_USERS, expect, login, test } from "./support";

const HTTP_NOT_FOUND = 404;

test.describe("access denied", () => {
  test("an account without a role cannot open a protected section", async ({ page }) => {
    await login(page, E2E_USERS.noRole);

    // The proxy answers a section the roles do not allow with a 404: it does not reveal itself.
    const response = await page.goto("/el-ancla/movements");
    expect(response?.status()).toBe(HTTP_NOT_FOUND);
    await expect(page.getByText("This page could not be found.")).toBeVisible();
  });

  test("an account without a role only gets its own account tab in settings", async ({ page }) => {
    await login(page, E2E_USERS.noRole);
    await page.goto("/el-ancla/settings?tab=roles");

    await expect(page.getByRole("tab", { name: "Mi cuenta" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Roles y permisos" })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Usuarios" })).toHaveCount(0);
  });

  test("a treasurer does not see the roles tab", async ({ page }) => {
    await login(page, E2E_USERS.treasurer);
    await page.goto("/el-ancla/settings?tab=roles");

    await expect(page.getByRole("tab", { name: "Roles y permisos" })).toHaveCount(0);
    const rolesPage = await page.goto("/el-ancla/settings/roles/new");
    expect(rolesPage?.status()).toBe(HTTP_NOT_FOUND);
  });
});
