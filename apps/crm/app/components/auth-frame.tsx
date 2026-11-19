import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoginHero } from "./login-hero";

const authFramePage = {
  main: cn("min-h-svh bg-[var(--canvas)] p-0 md:p-8"),
  frame: cn(
    "flex min-h-svh gap-2.5 bg-background p-0 md:min-h-[calc(100svh-4rem)] md:rounded-[40px] md:p-2.5",
    "md:shadow-(--sombra-flotante)",
  ),
  formPane: cn("flex flex-[0.8] items-center justify-center p-6 md:p-[30px]"),
};

/** Page frame shared by every signed-out screen: login, invitation, two-factor, password reset. */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className={authFramePage.main}>
      <div className={authFramePage.frame}>
        <LoginHero />
        <div className={authFramePage.formPane}>{children}</div>
      </div>
    </main>
  );
}
