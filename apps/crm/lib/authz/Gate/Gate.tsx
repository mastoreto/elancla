"use client";

import type { Permission } from "@ancla/contracts";
import type { ReactNode } from "react";
import { useAccess } from "../AccessProvider";
import { canAny } from "../can";

interface CanProps {
  /** Renders the children when the user holds any of these permissions. */
  permission: Permission | readonly Permission[];
  children: ReactNode;
}

/** Hides what the user's roles do not allow. The API still enforces it; this is only the UI. */
export function Can({ permission, children }: CanProps) {
  const permissions = typeof permission === "string" ? [permission] : permission;
  return canAny(useAccess(), permissions) ? children : null;
}
