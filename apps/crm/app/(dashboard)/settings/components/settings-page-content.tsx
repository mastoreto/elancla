"use client";

import type {
  EditorialSettingsDto,
  InvitationDto,
  MeDto,
  MinistryDto,
  RoleDto,
  SiteKeyDto,
  UserDto,
} from "@ancla/contracts";
import { PERMISSIONS } from "@ancla/contracts";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { BoardTabs } from "@/components/dashboard/board/board-tabs";
import { useAccess } from "@/lib/authz/AccessProvider";
import { canAny } from "@/lib/authz/can";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";
import { SETTINGS_TAB_PERMISSIONS } from "../data/settings-tabs";
import type {
  BankAccountSetting,
  CurrencySetting,
  NotificationSettings,
  SettingsTabValue,
} from "../types";
import { AccountPanel } from "./account-panel";
import { BankAccountsCard } from "./bank-accounts-card";
import { ChurchIdentityCard } from "./church-identity-card";
import { CreateSiteKeyDialog } from "./create-site-key-dialog";
import { CurrenciesCard } from "./currencies-card";
import { EditorialSettingsPanel } from "./editorial-settings-panel";
import { InvitationsPanel } from "./invitations-panel";
import { InviteDialog } from "./invite-dialog";
import { NotificationsPanel } from "./notifications-panel";
import { RolesPanel } from "./roles-panel";
import { SiteKeysCard } from "./site-keys-card";
import { UserDialog } from "./user-dialog";
import { UsersPanel } from "./users-panel";

const INTRO: Record<SettingsTabValue, string> = {
  users: "Usuarios, identidad, cuentas, monedas y reglas de la iglesia.",
  church: "Identidad de la iglesia, cuentas bancarias y monedas.",
  bankAccounts: "Identidad de la iglesia, cuentas bancarias y monedas.",
  currencies: "Identidad de la iglesia, cuentas bancarias y monedas.",
  roles: "Roles con permisos claros para limitar alcance, aprobaciones y auditoría.",
  website: "Claves con las que el sitio público lee el contenido de la iglesia.",
  editorial: "Quién revisa el contenido antes de publicarlo y a quién se le exige revisión.",
  notifications: "Elige qué avisos recibe tu equipo y por qué canal.",
  audit: "Registro inalterable de lo que ocurre en el sistema.",
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
  initialTab: SettingsTabValue;
  churchName: string;
  churchSubtitle: string;
  /** `null` for each list the caller may not see (the API answered 403). */
  users: UserDto[] | null;
  invitations: InvitationDto[] | null;
  me: MeDto | null;
  roles: RoleDto[] | null;
  ministries: MinistryDto[] | null;
  siteKeys: SiteKeyDto[] | null;
  editorialSettings: EditorialSettingsDto[] | null;
  bankAccounts: BankAccountSetting[];
  currencies: CurrencySetting[];
  notifications: NotificationSettings;
}

export function SettingsPageContent({
  initialTab,
  churchName,
  churchSubtitle,
  users,
  invitations,
  me,
  roles,
  ministries,
  siteKeys,
  editorialSettings,
  bankAccounts,
  currencies,
  notifications: initialNotifications,
}: SettingsPageContentProps) {
  const [tab, setTab] = useState<SettingsTabValue>(initialTab);
  const access = useAccess();
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [dialogUser, setDialogUser] = useState<UserDto | undefined>(undefined);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [siteKeyDialogOpen, setSiteKeyDialogOpen] = useState(false);
  const pendingInvitations = invitations?.filter((item) => item.status === "pending").length ?? 0;

  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    label: `${currency.code} · ${currency.symbol}`,
  }));

  const tabs: { value: SettingsTabValue; label: string; count?: number }[] = [
    { value: "users", label: "Usuarios", count: users?.length },
    { value: "church", label: "Iglesia" },
    { value: "bankAccounts", label: "Cuentas bancarias", count: bankAccounts.length },
    { value: "currencies", label: "Monedas", count: currencies.length },
    { value: "roles", label: "Roles y permisos" },
    { value: "website", label: "Sitio web" },
    { value: "editorial", label: "Revisión editorial" },
    { value: "notifications", label: "Notificaciones" },
    { value: "audit", label: "Auditoría" },
    { value: "account", label: "Mi cuenta" },
  ];
  const showIdentity = tab === "church";
  const showBankAccounts = tab === "church" || tab === "bankAccounts";
  const showCurrencies = tab === "church" || tab === "currencies";

  return (
    <div className={settingsPageContentSettingsPage.container}>
      <div className={settingsPageContentSettingsPage.intro}>
        <span className={settingsPageContentSettingsPage.description}>{INTRO[tab]}</span>
        {tab === "users" && canAny(access, [PERMISSIONS.invitations.create]) ? (
          <BoardButton onClick={() => setInviteOpen(true)} variant="primary">
            <Plus aria-hidden="true" className={settingsPageContentSettingsPage.icon} />
            Invitar usuario
          </BoardButton>
        ) : null}
        {tab === "website" && canAny(access, [PERMISSIONS.siteKeys.create]) ? (
          <BoardButton onClick={() => setSiteKeyDialogOpen(true)} variant="primary">
            <Plus aria-hidden="true" className={settingsPageContentSettingsPage.icon} />
            Crear clave
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
        items={tabs.filter((item) => canAny(access, SETTINGS_TAB_PERMISSIONS[item.value]))}
        label="Secciones de configuración"
        onValueChange={(next) =>
          // Auditoría is a page of its own (filters live in the URL), not a panel of this one.
          next === "audit" ? router.push(getChurchRoutePath("settings", "audit")) : setTab(next)
        }
        value={tab}
      />

      {tab === "users" && users ? (
        <>
          <UsersPanel
            onEdit={setDialogUser}
            pendingInvitations={pendingInvitations}
            roles={roles}
            users={users}
          />
          <InvitationsPanel invitations={invitations} roles={roles} />
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

      {tab === "roles" && roles ? <RolesPanel roles={roles} /> : null}

      {tab === "website" ? <SiteKeysCard siteKeys={siteKeys} /> : null}

      {tab === "editorial" ? (
        <EditorialSettingsPanel roles={roles} settings={editorialSettings} users={users} />
      ) : null}

      {tab === "notifications" ? (
        <NotificationsPanel
          currencyOptions={currencyOptions}
          onChange={setNotifications}
          value={notifications}
        />
      ) : null}

      <UserDialog
        ministries={ministries}
        onOpenChange={(open) => !open && setDialogUser(undefined)}
        roles={roles}
        user={dialogUser}
      />
      <CreateSiteKeyDialog
        onFinished={() => router.refresh()}
        onOpenChange={setSiteKeyDialogOpen}
        open={siteKeyDialogOpen}
      />
      <InviteDialog
        ministries={ministries}
        roles={roles}
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
