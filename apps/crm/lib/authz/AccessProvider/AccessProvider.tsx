"use client";

import type { MePermissionsDto } from "@ancla/contracts";
import { createContext, type ReactNode, useContext } from "react";

const AccessContext = createContext<MePermissionsDto | null>(null);

interface AccessProviderProps {
  access: MePermissionsDto;
  children: ReactNode;
}

/** Hands the signed-in user's permissions (loaded on the server) to the client components. */
export function AccessProvider({ access, children }: AccessProviderProps) {
  return <AccessContext.Provider value={access}>{children}</AccessContext.Provider>;
}

export function useAccess(): MePermissionsDto {
  const access = useContext(AccessContext);
  if (!access) throw new Error("useAccess must be used inside <AccessProvider>");
  return access;
}
