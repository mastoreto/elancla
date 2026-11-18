"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardTabs } from "@/components/dashboard/board/board-tabs";
import { cn } from "@/lib/utils";
import type { UserInviteValues } from "../schema";
import type {
  BankAccountSetting,
  CurrencySetting,
  NotificationSettings,
  SettingsRole,
  SettingsSelectOption,
  SettingsTabValue,
  SettingsUser,
} from "../types";
import { BankAccountsCard } from "./bank-accounts-card";
import { ChurchIdentityCard } from "./church-identity-card";
import { CurrenciesCard } from "./currencies-card";
import { NotificationsPanel } from "./notifications-panel";
import { RolesPanel } from "./roles-panel";
import { UserDialog } from "./user-dialog";
import { UsersPanel } from "./users-panel";

const INTRO: Record<SettingsTabValue, string> = {
  users: "Usuarios, identidad, cuentas, monedas y reglas de la iglesia.",
  church: "Identidad de la iglesia, cuentas bancarias y monedas.",
  bankAccounts: "Identidad de la iglesia, cuentas bancarias y monedas.",
  currencies: "Identidad de la iglesia, cuentas bancarias y monedas.",
  roles: "Roles con permisos claros para limitar alcance, aprobaciones y auditoría.",
  notifications: "Elige qué avisos recibe tu equipo y por qué canal.",
};

const settingsPageContentSettingsPage = {
  container: cn("flex flex-col gap-5"),
  intro: cn("flex items-center gap-4"),
  description: cn("flex-1 text-[14.5px] leading-normal text-[var(--tinta-suave)]"),
  icon: cn("size-4"),
  panel: cn("flex flex-col gap-5"),
};

interface SettingsPageContentProps {
  churchName: string;
  churchSubtitle: string;
  users: SettingsUser[];
  pendingInvitations: number;
  roles: SettingsRole[];
  bankAccounts: BankAccountSetting[];
  currencies: CurrencySetting[];
  notifications: NotificationSettings;
  ministryOptions: SettingsSelectOption[];
}

export function SettingsPageContent({
  churchName,
  churchSubtitle,
  users: initialUsers,
  pendingInvitations: initialPending,
  roles: initialRoles,
  bankAccounts,
  currencies,
  notifications: initialNotifications,
  ministryOptions,
}: SettingsPageContentProps) {
  const [tab, setTab] = useState<SettingsTabValue>("users");
  const [users, setUsers] = useState(initialUsers);
  const [pending, setPending] = useState(initialPending);
  const [roles, setRoles] = useState(initialRoles);
  const [notifications, setNotifications] = useState(initialNotifications);
  // `undefined` = closed, `null` = inviting, otherwise the user being edited.
  const [dialogUser, setDialogUser] = useState<SettingsUser | null | undefined>(undefined);

  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    label: `${currency.code} · ${currency.symbol}`,
  }));

  const submitUser = (values: UserInviteValues) => {
    if (dialogUser) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === dialogUser.id
            ? {
                ...user,
                name: values.name,
                email: values.email,
                role: values.role as SettingsUser["role"],
              }
            : user,
        ),
      );
      toast.success("Usuario actualizado");
    } else {
      setPending((previous) => previous + 1);
      toast.success(`Invitación enviada a ${values.email}`);
    }
    setDialogUser(undefined);
  };

  const showIdentity = tab === "church";
  const showBankAccounts = tab === "church" || tab === "bankAccounts";
  const showCurrencies = tab === "church" || tab === "currencies";

  return (
    <div className={settingsPageContentSettingsPage.container}>
      <div className={settingsPageContentSettingsPage.intro}>
        <span className={settingsPageContentSettingsPage.description}>{INTRO[tab]}</span>
        {tab === "users" ? (
          <BoardButton onClick={() => setDialogUser(null)} variant="primary">
            <Plus aria-hidden="true" className={settingsPageContentSettingsPage.icon} />
            Crear usuario
          </BoardButton>
        ) : null}
        {tab === "notifications" ? (
          <BoardButton
            onClick={() => toast.success("Preferencias de notificaciones guardadas")}
            variant="primary"
          >
            <Check aria-hidden="true" className={settingsPageContentSettingsPage.icon} />
            Guardar cambios
          </BoardButton>
        ) : null}
      </div>

      <BoardTabs
        items={[
          { value: "users", label: "Usuarios", count: users.length },
          { value: "church", label: "Iglesia" },
          { value: "bankAccounts", label: "Cuentas bancarias", count: bankAccounts.length },
          { value: "currencies", label: "Monedas", count: currencies.length },
          { value: "roles", label: "Roles y permisos" },
          { value: "notifications", label: "Notificaciones" },
        ]}
        label="Secciones de configuración"
        onValueChange={setTab}
        value={tab}
      />

      {tab === "users" ? (
        <UsersPanel
          onDelete={(userId) =>
            setUsers((previous) => previous.filter((user) => user.id !== userId))
          }
          onEdit={setDialogUser}
          pendingInvitations={pending}
          users={users}
        />
      ) : null}

      {showIdentity || showBankAccounts || showCurrencies ? (
        <div className={settingsPageContentSettingsPage.panel}>
          {showIdentity ? (
            <ChurchIdentityCard initialName={churchName} initialSubtitle={churchSubtitle} />
          ) : null}
          {showBankAccounts ? <BankAccountsCard initialAccounts={bankAccounts} /> : null}
          {showCurrencies ? <CurrenciesCard initialCurrencies={currencies} /> : null}
        </div>
      ) : null}

      {tab === "roles" ? (
        <RolesPanel
          onDelete={(roleId) =>
            setRoles((previous) => previous.filter((role) => role.id !== roleId))
          }
          roles={roles}
        />
      ) : null}

      {tab === "notifications" ? (
        <NotificationsPanel
          currencyOptions={currencyOptions}
          onChange={setNotifications}
          value={notifications}
        />
      ) : null}

      <UserDialog
        ministryOptions={ministryOptions}
        onOpenChange={(open) => !open && setDialogUser(undefined)}
        onSubmit={submitUser}
        open={dialogUser !== undefined}
        user={dialogUser ?? null}
      />
    </div>
  );
}
