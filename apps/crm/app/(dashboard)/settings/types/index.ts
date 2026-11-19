export type SettingsTabValue =
  | "users"
  | "church"
  | "bankAccounts"
  | "currencies"
  | "roles"
  | "notifications"
  | "account";

export interface SettingsSelectOption {
  value: string;
  label: string;
}

export type RoleProfile = "admin" | "treasury" | "leader" | "reader";

export type PermissionModuleId =
  | "movements"
  | "requests"
  | "vouchers"
  | "projects"
  | "budgets"
  | "voting"
  | "reports"
  | "content"
  | "settings";

export type PermissionActionId = "view" | "create" | "edit" | "approve" | "delete";

/** Actions granted on each module. */
export type PermissionGrid = Record<PermissionModuleId, PermissionActionId[]>;

export type PermissionPresetId = "readonly" | "operational" | "full";

export interface SettingsRole {
  id: string;
  name: string;
  profile: RoleProfile;
  description: string;
  /** Short chips describing where the role can act. */
  scope: string[];
  membersCount: number;
  permissions: PermissionGrid;
}

export type SettingsAvatarTone = "gold" | "rose" | "green" | "ink";

export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  tone: SettingsAvatarTone;
  role: RoleProfile;
  lastAccess: string;
}

export interface BankAccountSetting {
  id: string;
  bank: string;
  branch: string;
  accountNumber: string;
  currency: "UYU" | "USD";
  owner: string;
}

export type CurrencyRounding = "integer" | "decimals";

export interface CurrencySetting {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: string;
  rounding: CurrencyRounding;
  active: boolean;
}

export interface NotificationRule {
  id: string;
  title: string;
  description: string;
  inApp: boolean;
  email: boolean;
}

export interface NotificationSettings {
  rules: NotificationRule[];
  threshold: string;
  thresholdCurrency: string;
  dailySummary: boolean;
  summaryHour: string;
}
