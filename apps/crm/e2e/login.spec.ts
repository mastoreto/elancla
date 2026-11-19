import { DASHBOARD_URL, E2E_USERS, expect, login, submitLogin, test } from "./support";

test.describe("login", () => {
  test("a valid account lands on the dashboard", async ({ page }) => {
    await login(page, E2E_USERS.admin);
    await expect(page).toHaveURL(DASHBOARD_URL);
  });

  test("a wrong password shows an error and stays on the login page", async ({ page }) => {
    await submitLogin(page, E2E_USERS.admin, "not-the-right-password");
    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();
    await expect(page).not.toHaveURL(DASHBOARD_URL);
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  });
});
