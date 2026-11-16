import { BellRing, Coins, Landmark, ShieldCheck, Users } from "lucide-react";
import type {
  BankAccountSetting,
  CurrencySetting,
  NotificationSetting,
  SettingsRole,
  SettingsSelectOption,
  SettingsTabValue,
  SettingsUser,
} from "@/app/(dashboard)/settings/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChurchConfig } from "@/lib/church";
import { BankAccountsPanel } from "./bank-accounts-panel";
import { ChurchSettingsPanel } from "./church-settings-panel";
import { CurrenciesPanel } from "./currencies-panel";
import { NotificationsPanel } from "./notifications-panel";
import { RolesPermissionsPanel } from "./roles-permissions-panel";
import { SettingsSummaryCard } from "./settings-summary-card";
import { UsersSettingsPanel } from "./users-settings-panel";

interface SettingsPageContentProps {
  church: ChurchConfig;
  users: SettingsUser[];
  roles: SettingsRole[];
  bankAccounts: BankAccountSetting[];
  currencies: CurrencySetting[];
  notifications: NotificationSetting[];
  ministryOptions: SettingsSelectOption[];
  roleOptions: SettingsSelectOption[];
}

const settingsTabs: Array<{
  value: SettingsTabValue;
  label: string;
}> = [
  { value: "church", label: "Iglesia" },
  { value: "users", label: "Usuarios" },
  { value: "roles", label: "Roles y Permisos" },
  { value: "bankAccounts", label: "Cuentas Bancarias" },
  { value: "currencies", label: "Monedas" },
  { value: "notifications", label: "Notificaciones" },
];

export function SettingsPageContent({
  church,
  users,
  roles,
  bankAccounts,
  currencies,
  notifications,
  ministryOptions,
  roleOptions,
}: SettingsPageContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Configuración del sistema</h1>
          <p className="text-muted-foreground max-w-3xl text-sm">
            Centraliza identidad institucional, usuarios, permisos, cuentas, monedas y
            notificaciones desde una sola interfaz.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline">
            Ver auditoría
          </Button>
          <Button type="button">Guardar cambios</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SettingsSummaryCard
          title="Usuarios activos"
          value={String(users.filter((user) => user.status === "Activo").length)}
          description="Cuentas habilitadas para operar en el período."
          icon={Users}
        />
        <SettingsSummaryCard
          title="Roles definidos"
          value={String(roles.length)}
          description="Perfiles disponibles para segmentar permisos."
          icon={ShieldCheck}
        />
        <SettingsSummaryCard
          title="Cuentas operativas"
          value={String(
            bankAccounts.filter((account) => account.status !== "En conciliación").length,
          )}
          description="Cuentas listas para cobros, pagos y control."
          icon={Landmark}
        />
        <SettingsSummaryCard
          title="Monedas visibles"
          value={String(currencies.length)}
          description="Configuraciones activas para registro y reportes."
          icon={Coins}
        />
        <SettingsSummaryCard
          title="Notificaciones activas"
          value={String(notifications.filter((notification) => notification.enabled).length)}
          description="Reglas habilitadas para alertas del sistema."
          icon={BellRing}
        />
      </div>

      <Tabs defaultValue="church">
        <TabsList className="w-full flex-wrap justify-start">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="church">
          <ChurchSettingsPanel church={church} />
        </TabsContent>

        <TabsContent value="users">
          <UsersSettingsPanel
            users={users}
            ministryOptions={ministryOptions}
            roleOptions={roleOptions}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolesPermissionsPanel roles={roles} />
        </TabsContent>

        <TabsContent value="bankAccounts">
          <BankAccountsPanel accounts={bankAccounts} />
        </TabsContent>

        <TabsContent value="currencies">
          <CurrenciesPanel currencies={currencies} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsPanel notifications={notifications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
