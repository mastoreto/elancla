import { cn } from "@/lib/utils";
import { ROLE_PROFILE_LABELS } from "../data/roles";
import type { RoleProfile } from "../types";

const PROFILE_STYLES = {
  admin: { pill: cn("bg-foreground text-white"), dot: cn("bg-white") },
  treasury: {
    pill: cn("bg-[var(--granada-50)] text-primary shadow-[inset_0_0_0_1px_rgba(194,58,78,0.13)]"),
    dot: cn("bg-primary"),
  },
  leader: {
    pill: cn("bg-[var(--oro-50)] text-[var(--oro-texto)] shadow-[inset_0_0_0_1px_var(--oro-100)]"),
    dot: cn("bg-[var(--oro)]"),
  },
  reader: {
    pill: cn("bg-secondary text-[var(--tinta-suave)] shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]"),
    dot: cn("bg-[var(--tinta-apagada)]"),
  },
} satisfies Record<RoleProfile, { pill: string; dot: string }>;

const roleProfilePillSettingsPage = {
  base: cn(
    "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
  ),
  dot: cn("size-1.5 rounded-full"),
};

interface RoleProfilePillProps {
  profile: RoleProfile;
  withDot?: boolean;
}

export function RoleProfilePill({ profile, withDot = false }: RoleProfilePillProps) {
  const styles = PROFILE_STYLES[profile];
  return (
    <span className={cn(roleProfilePillSettingsPage.base, styles.pill)}>
      {withDot ? <span className={cn(roleProfilePillSettingsPage.dot, styles.dot)} /> : null}
      {ROLE_PROFILE_LABELS[profile]}
    </span>
  );
}
