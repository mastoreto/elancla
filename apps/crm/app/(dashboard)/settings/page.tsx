import { SettingsPageContent } from "@/app/(dashboard)/settings/components/settings-page-content";
import type {
  BankAccountSetting,
  CurrencySetting,
  NotificationSetting,
  SettingsSelectOption,
  SettingsUser,
} from "@/app/(dashboard)/settings/types";
import { churchConfig } from "@/lib/church";
import { ministries } from "@/lib/data";
import { settingsRoles as roles } from "./data/roles";

const users: SettingsUser[] = [
  {
    id: "user-1",
    name: "María González",
    email: "maria.gonzalez@parroquia.uy",
    userType: "Líder",
    ministry: "Ministerio de Jóvenes",
    role: "Tesorera General",
    status: "Activo",
    lastAccess: "Hoy, 08:42",
  },
  {
    id: "user-2",
    name: "Juan Pereira",
    email: "juan.pereira@parroquia.uy",
    userType: "Colaborador",
    ministry: "Misiones",
    role: "Revisor Financiero",
    status: "Activo",
    lastAccess: "Ayer, 18:10",
  },
  {
    id: "user-3",
    name: "Lucía Martínez",
    email: "lucia.martinez@parroquia.uy",
    userType: "Miembro",
    ministry: "Equipo de Adoración",
    role: "Operadora de Cajas",
    status: "Pendiente",
    lastAccess: "Sin activación",
  },
  {
    id: "user-4",
    name: "Carlos Suárez",
    email: "carlos.suarez@parroquia.uy",
    userType: "Colaborador",
    ministry: "Alcance Comunitario",
    role: "Consulta",
    status: "Suspendido",
    lastAccess: "12 mar 2026",
  },
];

const bankAccounts: BankAccountSetting[] = [
  {
    id: "account-1",
    alias: "Cuenta Corriente Principal",
    bankName: "BROU",
    accountNumber: "001-3456789",
    currency: "UYU",
    owner: "Tesorería Parroquial",
    branch: "Centro",
    status: "Principal",
  },
  {
    id: "account-2",
    alias: "Caja USD Misiones",
    bankName: "Santander",
    accountNumber: "010-9988776",
    currency: "USD",
    owner: "Área Misionera",
    branch: "Cordón",
    status: "Activa",
  },
  {
    id: "account-3",
    alias: "Fondo Obras",
    bankName: "Itaú",
    accountNumber: "200-5544332",
    currency: "UYU",
    owner: "Comisión de Obras",
    branch: "Pocitos",
    status: "En conciliación",
  },
];

const currencies: CurrencySetting[] = [
  {
    code: "UYU",
    name: "Peso uruguayo",
    symbol: "$",
    exchangeRate: "Base operativa",
    rounding: "Enteros sin decimales para caja menor",
    status: "Base",
    updatedAt: "Hoy, 07:30",
  },
  {
    code: "USD",
    name: "Dólar estadounidense",
    symbol: "US$",
    exchangeRate: "42,10 UYU",
    rounding: "Dos decimales",
    status: "Operativa",
    updatedAt: "Hoy, 07:30",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    exchangeRate: "45,90 UYU",
    rounding: "Dos decimales",
    status: "Operativa",
    updatedAt: "Ayer, 17:45",
  },
];

const notifications: NotificationSetting[] = [
  {
    id: "notification-1",
    title: "Solicitud pendiente de aprobación",
    channel: "Sistema",
    audience: "Tesorería General",
    frequency: "Inmediata",
    enabled: true,
    description: "Avisa cuando una solicitud supera el umbral de aprobación configurado.",
  },
  {
    id: "notification-2",
    title: "Conciliación bancaria atrasada",
    channel: "Correo",
    audience: "Administración y Auditoría",
    frequency: "Diaria",
    enabled: true,
    description: "Resume cuentas pendientes de conciliación al cierre del día.",
  },
  {
    id: "notification-3",
    title: "Observación sobre comprobante",
    channel: "WhatsApp",
    audience: "Responsables operativos",
    frequency: "Programada",
    enabled: false,
    description: "Comunica observaciones abiertas sobre justificativos sin respaldo fiscal.",
  },
];

const ministryOptions: SettingsSelectOption[] = ministries.map((ministry) => ({
  value: ministry.name,
  label: ministry.name,
}));

const roleOptions: SettingsSelectOption[] = roles.map((role) => ({
  value: role.name,
  label: role.name,
}));

export default function SettingsPage() {
  return (
    <SettingsPageContent
      church={churchConfig}
      users={users}
      roles={roles}
      bankAccounts={bankAccounts}
      currencies={currencies}
      notifications={notifications}
      ministryOptions={ministryOptions}
      roleOptions={roleOptions}
    />
  );
}
