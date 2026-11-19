import type { MeDto } from "@ancla/contracts";
import { BoardCard } from "@/components/dashboard/board/board-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AccountMethodsCard } from "./account-methods-card";
import { AccountTwoFactorCard } from "./account-two-factor-card";

const accountPanelSettingsPage = {
  container: cn("flex flex-col gap-5"),
  profile: cn("flex items-center gap-4 p-5"),
  avatar: cn("size-16"),
  initials: cn("bg-secondary text-lg font-bold"),
  text: cn("flex min-w-0 flex-col"),
  name: cn("font-display text-xl font-medium"),
  email: cn("truncate text-sm text-[var(--tinta-apagada)]"),
  empty: cn("p-5 text-sm text-[var(--tinta-apagada)]"),
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** "Mi cuenta": profile, linked sign-in methods and two-factor. `me` is null without a session. */
export function AccountPanel({ me }: { me: MeDto | null }) {
  if (!me) {
    return (
      <BoardCard>
        <p className={accountPanelSettingsPage.empty}>No pudimos cargar tu cuenta.</p>
      </BoardCard>
    );
  }
  return (
    <div className={accountPanelSettingsPage.container}>
      <BoardCard className={accountPanelSettingsPage.profile}>
        <Avatar className={accountPanelSettingsPage.avatar}>
          {me.image ? (
            <AvatarImage alt={me.name} referrerPolicy="no-referrer" src={me.image} />
          ) : null}
          <AvatarFallback className={accountPanelSettingsPage.initials}>
            {initialsOf(me.name)}
          </AvatarFallback>
        </Avatar>
        <div className={accountPanelSettingsPage.text}>
          <span className={accountPanelSettingsPage.name}>{me.name}</span>
          <span className={accountPanelSettingsPage.email}>{me.email}</span>
        </div>
      </BoardCard>
      <AccountMethodsCard methods={me.methods} />
      <AccountTwoFactorCard
        hasPassword={me.methods.includes("password")}
        twoFactorEnabled={me.twoFactorEnabled}
      />
    </div>
  );
}
