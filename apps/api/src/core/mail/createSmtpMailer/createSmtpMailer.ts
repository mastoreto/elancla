import nodemailer from "nodemailer";
import type { Mailer } from "../types";

interface SmtpMailerOptions {
  smtpUrl: string;
  from: string;
}

/** SMTP adapter (Mailpit in development). ponytail: the production provider arrives in 0.8. */
export function createSmtpMailer({ smtpUrl, from }: SmtpMailerOptions): Mailer {
  const transport = nodemailer.createTransport(smtpUrl);
  return {
    async send({ to, subject, html, text }) {
      await transport.sendMail({ from, to, subject, html, text });
    },
  };
}
