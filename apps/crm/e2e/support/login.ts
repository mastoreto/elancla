import { expect, type Page } from "@playwright/test";
import { E2E_PASSWORD } from "./users";

export const DASHBOARD_URL = /\/el-ancla\/resume/;

/** Fills the login form and submits it; it does not wait for the next page. */
export async function submitLogin(
  page: Page,
  email: string,
  password = E2E_PASSWORD,
): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

/** Signs in with a password and waits for the dashboard. */
export async function login(page: Page, email: string, password = E2E_PASSWORD): Promise<void> {
  await submitLogin(page, email, password);
  await expect(page).toHaveURL(DASHBOARD_URL);
}
