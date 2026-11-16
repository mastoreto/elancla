// Re-export the shared implementation from @ancla/utils.
// Kept as a local module so existing `import cn from '.../utils/cn'` call sites keep working.
export { cn as default } from '@ancla/utils';
