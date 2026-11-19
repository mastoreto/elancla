import {
  clientAddressHeaders,
  DASHBOARD_URL,
  E2E_USERS,
  expect,
  findLink,
  latestMailTo,
  login,
  test,
} from "./support";

const NEW_USER_PASSWORD = "a-brand-new-password-123";

test("an admin invites a person who sets a password and enters the dashboard", async ({
  page,
  browser,
}) => {
  const invitedEmail = `e2e-invited-${crypto.randomUUID()}@example.test`;

  await login(page, E2E_USERS.admin);
  await page.goto("/el-ancla/settings?tab=users");
  await page.getByRole("button", { name: "Invitar usuario" }).click();
  await page.getByLabel("Email").fill(invitedEmail);
  await page.getByRole("checkbox", { name: /Tesorero/ }).check();
  await page.getByRole("button", { name: "Enviar invitación" }).click();
  // The toast is transient; the pending row in the list is what proves the invitation exists.
  await expect(page.getByRole("button", { name: `Reenviar a ${invitedEmail}` })).toBeVisible();

  const invitationLink = findLink(await latestMailTo(invitedEmail), "/invitation/");

  // The invited person has no session: a clean browser context, like another device.
  const guest = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const guestPage = await guest.newPage();
  await guestPage.goto(invitationLink);
  await guestPage.getByLabel("Nombre y apellido").fill("Invited Person");
  await guestPage.getByLabel("Contraseña (mínimo 12 caracteres)").fill(NEW_USER_PASSWORD);
  await guestPage.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(
    guestPage.getByText("Tu cuenta está lista. Inicia sesión para entrar."),
  ).toBeVisible();
  await login(guestPage, invitedEmail, NEW_USER_PASSWORD);
  await expect(guestPage).toHaveURL(DASHBOARD_URL);
  await guest.close();
});
