export type SettingsTabValue =
  | "church"
  | "users"
  | "roles"
  | "bankAccounts"
  | "currencies"
  | "notifications";
export type SettingsUserType = "Miembro" | "Líder" | "Colaborador";

export interface SettingsSelectOption {
  value: string;
  label: string;
}

export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  userType: SettingsUserType;
  ministry: string;
  role: string;
  status: "Activo" | "Pendiente" | "Suspendido";
  lastAccess: string;
}

export interface SettingsUserFormValues {
  fullName: string;
  userType: SettingsUserType | "";
  ministry: string;
  email: string;
  role: string;
}

export type SettingsUserFormField = keyof SettingsUserFormValues;

export interface SettingsRole {
  id: string;
  name: string;
  description: string;
  scope: string;
  membersCount: number;
  permissions: string[];
}

export interface BankAccountSetting {
  id: string;
  alias: string;
  bankName: string;
  accountNumber: string;
  currency: "UYU" | "USD";
  owner: string;
  branch: string;
  status: "Principal" | "Activa" | "En conciliación";
}

export interface CurrencySetting {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: string;
  rounding: string;
  status: "Base" | "Operativa";
  updatedAt: string;
}

export interface NotificationSetting {
  id: string;
  title: string;
  channel: "Sistema" | "Correo" | "WhatsApp";
  audience: string;
  frequency: string;
  enabled: boolean;
  description: string;
}
