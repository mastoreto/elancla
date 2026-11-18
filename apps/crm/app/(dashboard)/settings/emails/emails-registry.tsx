import { render } from "@react-email/render";
import { InvitationEmail, NoticeEmail, PasswordResetEmail, ReportEmail } from "@/emails";

export const EMAIL_TEMPLATES = {
  invitation: {
    label: "Invitación",
    render: () => render(<InvitationEmail {...InvitationEmail.PreviewProps} />),
  },
  password: {
    label: "Contraseña",
    render: () => render(<PasswordResetEmail {...PasswordResetEmail.PreviewProps} />),
  },
  report: { label: "Informe", render: () => render(<ReportEmail {...ReportEmail.PreviewProps} />) },
  notice: { label: "Avisos", render: () => render(<NoticeEmail {...NoticeEmail.PreviewProps} />) },
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;

export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return value in EMAIL_TEMPLATES;
}
