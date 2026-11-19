import { getApiEnv } from "../../env";
import { createSmtpMailer } from "../createSmtpMailer";
import type { Mailer } from "../types";

let current: Mailer | undefined;

/** Lazy like `getApiEnv`: nothing connects or validates at import time. */
export function getMailer(): Mailer {
  if (current) return current;
  const { SMTP_URL, MAIL_FROM } = getApiEnv();
  current = createSmtpMailer({ smtpUrl: SMTP_URL, from: MAIL_FROM });
  return current;
}

/** Tests swap the mailer for a recording fake; production code never calls this. */
export function setMailerForTests(mailer: Mailer | undefined): void {
  current = mailer;
}
