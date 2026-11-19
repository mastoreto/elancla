"use client";

import type { InvitationDto, MeDto } from "@ancla/contracts";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { AccountPanel } from "./account-panel";
import { BankAccountsCard } from "./bank-accounts-card";
import { ChurchIdentityCard } from "./church-identity-card";
import { CurrenciesCard } from "./currencies-card";
import { InvitationsPanel } from "./invitations-panel";
import { InviteDialog } from "./invite-dialog";
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
  account: "Tu perfil, tus métodos de acceso y la verificación en dos pasos.",
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
  invitations: InvitationDto[] | null;
  me: MeDto | null;
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
  invitations,
  me,
  roles: initialRoles,
  bankAccounts,
  currencies,
  notifications: initialNotifications,
  ministryOptions,
}: SettingsPageContentProps) {
  const [tab, setTab] = useState<SettingsTabValue>("users");
  const [users, setUsers] = useState(initialUsers);
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [dialogUser, setDialogUser] = useState<SettingsUser | undefined>(undefined);
  const [inviteOpen, setInviteOpen] = useState(false);
  const pendingInvitations = invitations?.filter((item) => item.status === "pending").length ?? 0;

  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    label: `${currency.code} · ${currency.symbol}`,
  }));

  const submitUser = (values: UserInviteValues) => {
    if (!dialogUser) return;
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
          <BoardButton onClick={() => setInviteOpen(true)} variant="primary">
            <Plus aria-hidden="true" className={settingsPageContentSettingsPage.icon} />
            Invitar usuario
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
          { value: "account", label: "Mi cuenta" },
        ]}
        label="Secciones de configuración"
        onValueChange={setTab}
        value={tab}
      />

      {tab === "users" ? (
        <>
          <UsersPanel
            onDelete={(userId) =>
              setUsers((previous) => previous.filter((user) => user.id !== userId))
            }
            onEdit={setDialogUser}
            pendingInvitations={pendingInvitations}
            users={users}
          />
          <InvitationsPanel invitations={invitations} />
        </>
      ) : null}

      {tab === "account" ? <AccountPanel me={me} /> : null}

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
        user={dialogUser}
      />
      <InviteDialog
        onInvited={(email) => {
          toast.success(`Invitación enviada a ${email}`);
          setInviteOpen(false);
          router.refresh();
        }}
        onOpenChange={setInviteOpen}
        open={inviteOpen}
      />
    </div>
  );
}
