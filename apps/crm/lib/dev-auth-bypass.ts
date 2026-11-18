/**
 * Lets screenshots and visual checks reach protected routes without a database session.
 * It only works in `next dev`: production builds ignore the flag, so it cannot open the CRM.
 */
export function isDevAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.CRM_DEV_SKIP_AUTH === "1";
}
