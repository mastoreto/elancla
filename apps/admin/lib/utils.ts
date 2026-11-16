// Re-export the shared implementation from @ancla/utils.
// Kept as a local module so existing `import { cn } from '@/lib/utils'` call sites keep working.
export { cn, parseLocalDate } from "@ancla/utils";
