import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes, resolving conflicts. Shared by both apps.
 * Exposed as both a named and default export so existing call sites
 * (web used `import cn from ...`, admin used `import { cn }`) keep working.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default cn;

/** Parses an ISO date string (YYYY-MM-DD) in local time to avoid UTC offset issues. */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
