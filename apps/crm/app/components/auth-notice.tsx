import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const authNoticePage = {
  base: cn("rounded-md px-3 py-2 text-sm"),
  tone: {
    error: cn("bg-destructive/10 text-destructive"),
    info: cn("bg-[var(--oro-50)] text-[var(--tinta-suave)]"),
  },
} satisfies Record<string, unknown>;

interface AuthNoticeProps {
  tone?: keyof typeof authNoticePage.tone;
  children: ReactNode;
}

export function AuthNotice({ tone = "error", children }: AuthNoticeProps) {
  return (
    <p
      className={cn(authNoticePage.base, authNoticePage.tone[tone])}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
