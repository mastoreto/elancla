import { render } from "@react-email/render";
import {
  InvitationEmail,
  NoticeEmail,
  noticeVariants,
  PasswordResetEmail,
  ReportEmail,
} from "@/emails";

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
  notice: { label: "Avisos", render: () => render(<NoticeEmail {...noticeVariants.approvals} />) },
  budget: {
    label: "Presupuesto",
    render: () => render(<NoticeEmail {...noticeVariants.budget} />),
  },
  reconcile: {
    label: "Conciliación",
    render: () => render(<NoticeEmail {...noticeVariants.reconcile} />),
  },
  approved: {
    label: "Aprobada",
    render: () => render(<NoticeEmail {...noticeVariants.approved} />),
  },
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;

export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return value in EMAIL_TEMPLATES;
}
