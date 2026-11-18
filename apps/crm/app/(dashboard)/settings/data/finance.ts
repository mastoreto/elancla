import type { BankAccountSetting, CurrencySetting, NotificationSettings } from "../types";

export const settingsBankAccounts: BankAccountSetting[] = [
  {
    id: "account-brou",
    bank: "BROU",
    branch: "Sucursal Centro",
    accountNumber: "001234567-00001",
    currency: "UYU",
    owner: "María García",
  },
  {
    id: "account-santander",
    bank: "Santander",
    branch: "Sucursal Cordón",
    accountNumber: "009876543-00002",
    currency: "USD",
    owner: "María García",
  },
];

export const settingsCurrencies: CurrencySetting[] = [
  {
    code: "UYU",
    name: "Peso uruguayo",
    symbol: "$U",
    exchangeRate: "1,00",
    rounding: "integer",
    active: true,
  },
  {
    code: "USD",
    name: "Dólar estadounidense",
    symbol: "$",
    exchangeRate: "39,40",
    rounding: "decimals",
    active: true,
  },
];

export const settingsNotifications: NotificationSettings = {
  rules: [
    {
      id: "pending-requests",
      title: "Solicitudes por aprobar",
      description: "Avisa cuando una solicitud supera el umbral de aprobación configurado.",
      inApp: true,
      email: true,
    },
    {
      id: "period-close",
      title: "Cierre de período",
      description: "Resume cuentas pendientes de conciliación al cierre del día.",
      inApp: true,
      email: false,
    },
    {
      id: "voucher-notes",
      title: "Observaciones de comprobantes",
      description: "Comunica observaciones abiertas sobre justificativos sin respaldo fiscal.",
      inApp: false,
      email: true,
    },
    {
      id: "budget-alert",
      title: "Presupuesto casi agotado",
      description: "Avisa cuando un ministerio supera el 85 % de su presupuesto.",
      inApp: true,
      email: true,
    },
    {
      id: "monthly-report",
      title: "Informe mensual",
      description: "Se envía el primer día de cada mes a tesorería y administración.",
      inApp: false,
      email: true,
    },
  ],
  threshold: "10.000",
  thresholdCurrency: "UYU",
  dailySummary: true,
  summaryHour: "18:00",
};

export const SUMMARY_HOURS = ["08:00", "12:00", "18:00", "20:00"] as const;
