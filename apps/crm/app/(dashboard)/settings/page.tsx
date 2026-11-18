import { ministries } from "@/lib/data";
import { SettingsPageContent } from "./components/settings-page-content";
import { settingsBankAccounts, settingsCurrencies, settingsNotifications } from "./data/finance";
import { settingsRoles } from "./data/roles";
import { PENDING_INVITATIONS, settingsUsers } from "./data/users";

const CHURCH_NAME = "Iglesia El Ancla";
const CHURCH_SUBTITLE = "Administración eclesiástica";

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default function SettingsPage() {
  return (
    <SettingsPageContent
      bankAccounts={settingsBankAccounts}
      churchName={CHURCH_NAME}
      churchSubtitle={CHURCH_SUBTITLE}
      currencies={settingsCurrencies}
      ministryOptions={ministries.map((ministry) => ({
        value: ministry.name,
        label: ministry.name,
      }))}
      notifications={settingsNotifications}
      pendingInvitations={PENDING_INVITATIONS}
      roles={settingsRoles}
      users={settingsUsers}
    />
  );
}
