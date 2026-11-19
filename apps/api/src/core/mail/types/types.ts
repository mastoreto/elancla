export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Outgoing email port. The SMTP adapter is the only implementation until phase 0.8. */
export interface Mailer {
  send(message: MailMessage): Promise<void>;
}
