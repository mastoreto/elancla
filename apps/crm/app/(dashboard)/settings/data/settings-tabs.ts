import type { Permission } from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import type { SettingsTabValue } from "../types";

/** Any one of these shows the tab; an empty list shows it to every signed-in user. */
export const SETTINGS_TAB_PERMISSIONS: Record<SettingsTabValue, readonly Permission[]> = {
  users: [PERMISSIONS.users.view],
  church: [PERMISSIONS.settings.view],
  bankAccounts: [PERMISSIONS.settings.view],
  currencies: [PERMISSIONS.settings.view],
  roles: [PERMISSIONS.roles.view],
  notifications: [PERMISSIONS.settings.view],
  audit: [PERMISSIONS.audit.view],
  account: [],
};
