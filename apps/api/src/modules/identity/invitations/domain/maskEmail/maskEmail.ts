const MASK = "***";

/** `maria@elancla.org` -> `m***@e***.org`. Shows enough to recognise the address, not to use it. */
export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const lastDot = domain.lastIndexOf(".");
  const host = lastDot === -1 ? domain : domain.slice(0, lastDot);
  const suffix = lastDot === -1 ? "" : domain.slice(lastDot);
  return `${local.slice(0, 1)}${MASK}@${host.slice(0, 1)}${MASK}${suffix}`;
}
