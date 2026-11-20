import { PERMISSIONS } from "@ancla/contracts";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { can, canAny } from "@/lib/authz/can";
import { getAccess } from "@/lib/authz/getAccess";
import { SettingsPageContent } from "./components/settings-page-content";
import { settingsBankAccounts, settingsCurrencies, settingsNotifications } from "./data/finance";
import { SETTINGS_TAB_PERMISSIONS } from "./data/settings-tabs";
import type { SettingsTabValue } from "./types";

const CHURCH_NAME = "Iglesia El Ancla";
const CHURCH_SUBTITLE = "Administración eclesiástica";
const SETTINGS_TABS: readonly SettingsTabValue[] = [
  "users",
  "church",
  "bankAccounts",
  "currencies",
  "roles",
  "website",
  "editorial",
  "notifications",
  "account",
];
const LIST_LIMIT = "100";
const FALLBACK_TAB: SettingsTabValue = "account";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string | string[] }>;
}

function toSettingsTab(value: string | string[] | undefined): SettingsTabValue | undefined {
  return SETTINGS_TABS.find((tab) => tab === value);
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const access = await getAccess();
  if (!access) notFound();

  // A person without settings permissions still reaches "Mi cuenta" (their own profile).
  const requested = toSettingsTab((await searchParams).tab);
  const initialTab =
    requested && canAny(access, SETTINGS_TAB_PERMISSIONS[requested]) ? requested : undefined;
  const defaultTab =
    SETTINGS_TABS.find((tab) => canAny(access, SETTINGS_TAB_PERMISSIONS[tab])) ?? FALLBACK_TAB;

  const api = await createServerApiClient();
  const query = { query: { limit: LIST_LIMIT } };
  // Each list is asked only when the role allows it; `null` tells the panel it is not available.
  const [
    meResponse,
    invitationsResponse,
    usersResponse,
    rolesResponse,
    ministriesResponse,
    siteKeysResponse,
    editorialSettingsResponse,
  ] = await Promise.all([
    api.me.$get(),
    can(access, PERMISSIONS.invitations.view) ? api.invitations.$get(query) : null,
    can(access, PERMISSIONS.users.view) ? api.users.$get(query) : null,
    can(access, PERMISSIONS.roles.view) ? api.roles.$get() : null,
    can(access, PERMISSIONS.ministryProfile.view) ? api.ministries.$get(query) : null,
    can(access, PERMISSIONS.siteKeys.view) ? api["site-keys"].$get() : null,
    can(access, PERMISSIONS.editorial.view) ? api.editorial.settings.$get() : null,
  ]);
  const me = meResponse.ok ? await meResponse.json() : null;
  const invitations = invitationsResponse?.ok ? (await invitationsResponse.json()).items : null;
  const users = usersResponse?.ok ? (await usersResponse.json()).items : null;
  const roles = rolesResponse?.ok ? await rolesResponse.json() : null;
  const ministries = ministriesResponse?.ok ? (await ministriesResponse.json()).items : null;
  const siteKeys = siteKeysResponse?.ok ? await siteKeysResponse.json() : null;
  const editorialSettings = editorialSettingsResponse?.ok
    ? await editorialSettingsResponse.json()
    : null;
  const tab = initialTab ?? defaultTab;

  return (
    <SettingsPageContent
      // A new ?tab= (e.g. "Mi cuenta" from the sidebar menu) remounts the content on that tab.
      key={tab}
      initialTab={tab}
      invitations={invitations}
      me={me}
      bankAccounts={settingsBankAccounts}
      churchName={CHURCH_NAME}
      churchSubtitle={CHURCH_SUBTITLE}
      currencies={settingsCurrencies}
      editorialSettings={editorialSettings}
      ministries={ministries}
      notifications={settingsNotifications}
      roles={roles}
      siteKeys={siteKeys}
      users={users}
    />
  );
}
