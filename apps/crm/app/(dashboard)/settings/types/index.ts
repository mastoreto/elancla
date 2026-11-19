import type { Permission, PermissionScope } from "@ancla/contracts";

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

/** The cells a role grants: permission to its scope. A missing key means "not granted". */
export type PermissionGrid = Partial<Record<Permission, PermissionScope>>;

export type PermissionPresetId = "readonly" | "operational" | "full";

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
