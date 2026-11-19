import type { Mailer, MailMessage } from "../../src/core/mail";

export interface RecordingMailer extends Mailer {
  sent: MailMessage[];
}

export function createRecordingMailer(): RecordingMailer {
  const sent: MailMessage[] = [];
  return {
    sent,
    async send(message) {
      sent.push(message);
    },
  };
}
