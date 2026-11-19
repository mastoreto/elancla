"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

export interface SidebarUser {
  name: string;
  email: string;
  image: string | null;
  role: string;
}

interface SidebarUserMenuProps {
  /** Null only under the development auth bypass, where there is no session. */
  user: SidebarUser | null;
}

const sidebarUserMenuSharedPage = {
  trigger: cn(
    "flex w-full items-center gap-2.5 rounded-xl px-1.5 pt-2 pb-1 text-left outline-none",
    "transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/60",
  ),
  avatar: cn("size-[38px] ring-2 ring-white"),
  avatarFallback: cn("bg-(image:--grad-avatar) text-sm font-extrabold text-[var(--oro-texto)]"),
  text: cn("flex min-w-0 flex-col leading-snug"),
  name: cn("truncate text-sm font-bold text-white"),
  role: cn("text-xs text-white/55"),
  chevron: cn("ml-auto size-4 shrink-0 text-white/60"),
  content: cn("w-(--radix-dropdown-menu-trigger-width) min-w-56"),
  email: cn("truncate px-2 py-1.5 text-xs text-muted-foreground"),
  icon: cn("size-4"),
};

// ponytail: flat roles until RBAC (phase 0.4) replaces them with the roles of the organization.
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  viewer: "Lector",
};
const DEV_BYPASS_USER: SidebarUser = {
  name: "Sesión de desarrollo",
  email: "",
  image: null,
  role: "",
};
const ACCOUNT_TAB_QUERY = "?tab=account";
const LOGIN_PATH = "/";

function getUserInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const shownUser = user ?? DEV_BYPASS_USER;

  async function signOut(): Promise<void> {
    setIsSigningOut(true);
    await authClient.signOut();
    // Full navigation drops every client-side cache of the previous session.
    window.location.assign(LOGIN_PATH);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={sidebarUserMenuSharedPage.trigger} disabled={!user}>
        <Avatar className={sidebarUserMenuSharedPage.avatar}>
          {shownUser.image ? (
            <AvatarImage alt="" referrerPolicy="no-referrer" src={shownUser.image} />
          ) : null}
          <AvatarFallback className={sidebarUserMenuSharedPage.avatarFallback}>
            {getUserInitials(shownUser.name)}
          </AvatarFallback>
        </Avatar>
        <span className={sidebarUserMenuSharedPage.text}>
          <b className={sidebarUserMenuSharedPage.name}>{shownUser.name}</b>
          <span className={sidebarUserMenuSharedPage.role}>
            {ROLE_LABELS[shownUser.role] ?? shownUser.role}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={sidebarUserMenuSharedPage.chevron} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={sidebarUserMenuSharedPage.content} side="top">
        <p className={sidebarUserMenuSharedPage.email}>{shownUser.email}</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild={true}>
          <Link href={`${getChurchRoutePath("settings")}${ACCOUNT_TAB_QUERY}`}>
            <UserRound aria-hidden="true" className={sidebarUserMenuSharedPage.icon} />
            Mi cuenta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isSigningOut} onSelect={signOut}>
          <LogOut aria-hidden="true" className={sidebarUserMenuSharedPage.icon} />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
