import {
  DASHBOARD_URL,
  E2E_PASSWORD,
  E2E_USERS,
  expect,
  login,
  submitLogin,
  test,
  totp,
} from "./support";

const WRONG_CODE = "000000";

test("an account turns on two-factor and then needs the code to sign in", async ({ page }) => {
  await login(page, E2E_USERS.twoFactor);

  await page.goto("/el-ancla/settings?tab=account");
  await page.getByRole("button", { name: "Activar" }).click();
  await page.getByLabel("Confirma tu contraseña").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Continuar" }).click();

  const manualKey = await page.locator("code").first().innerText();
  await page.getByLabel("Código de 6 dígitos").fill(totp(manualKey));
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page.getByText("Activada")).toBeVisible();

  // Sign out by dropping the session; the next login must ask for the second step.
  await page.context().clearCookies();
  await submitLogin(page, E2E_USERS.twoFactor);
  await expect(page).toHaveURL(/\/two-factor/);

  await page.getByLabel("Código de 6 dígitos").fill(WRONG_CODE);
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page.getByText("El código no es correcto.")).toBeVisible();

  await page.getByLabel("Código de 6 dígitos").fill(totp(manualKey));
  await page.getByRole("button", { name: "Verificar" }).click();
  await expect(page).toHaveURL(DASHBOARD_URL);
});
