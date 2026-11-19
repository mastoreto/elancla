import type { Permission } from "@ancla/contracts";
import type { SettingsTabValue } from "../types";

/** Any one of these shows the tab; an empty list shows it to every signed-in user. */
export const SETTINGS_TAB_PERMISSIONS: Record<SettingsTabValue, readonly Permission[]> = {
  users: ["users:view"],
  church: ["settings:view"],
  bankAccounts: ["settings:view"],
  currencies: ["settings:view"],
  roles: ["roles:view"],
  notifications: ["settings:view"],
  account: [],
};
