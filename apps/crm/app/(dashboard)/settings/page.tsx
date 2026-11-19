import { createServerApiClient } from "@/lib/api/createServerApiClient";
import { ministries } from "@/lib/data";
import { SettingsPageContent } from "./components/settings-page-content";
import { settingsBankAccounts, settingsCurrencies, settingsNotifications } from "./data/finance";
import { settingsRoles } from "./data/roles";
import { settingsUsers } from "./data/users";
import type { SettingsTabValue } from "./types";

const CHURCH_NAME = "Iglesia El Ancla";
const CHURCH_SUBTITLE = "Administración eclesiástica";
const SETTINGS_TABS: readonly SettingsTabValue[] = [
  "users",
  "church",
  "bankAccounts",
  "currencies",
  "roles",
  "notifications",
  "account",
];

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string | string[] }>;
}

function toSettingsTab(value: string | string[] | undefined): SettingsTabValue {
  return SETTINGS_TABS.find((tab) => tab === value) ?? "users";
}

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const initialTab = toSettingsTab((await searchParams).tab);
  const api = await createServerApiClient();
  const [meResponse, invitationsResponse] = await Promise.all([
    api.me.$get(),
    api.invitations.$get({ query: {} }),
  ]);
  const me = meResponse.ok ? await meResponse.json() : null;
  // A non-admin gets a 403: the panel then explains that only administrators invite.
  const invitations = invitationsResponse.ok ? (await invitationsResponse.json()).items : null;

  return (
    <SettingsPageContent
      // A new ?tab= (e.g. "Mi cuenta" from the sidebar menu) remounts the content on that tab.
      key={initialTab}
      initialTab={initialTab}
      invitations={invitations}
      me={me}
      bankAccounts={settingsBankAccounts}
      churchName={CHURCH_NAME}
      churchSubtitle={CHURCH_SUBTITLE}
      currencies={settingsCurrencies}
      ministryOptions={ministries.map((ministry) => ({
        value: ministry.name,
        label: ministry.name,
      }))}
      notifications={settingsNotifications}
      roles={settingsRoles}
      users={settingsUsers}
    />
  );
}
