import { render } from "@react-email/render";
import type { ReactElement } from "react";
import {
  InvitationEmail,
  type InvitationEmailProps,
} from "../templates/invitation-email";
import {
  PasswordResetEmail,
  type PasswordResetEmailProps,
} from "../templates/password-reset-email";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

async function renderBoth(
  subject: string,
  element: ReactElement,
): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { subject, html, text };
}

export function renderInvitationEmail(
  props: InvitationEmailProps,
): Promise<RenderedEmail> {
  return renderBoth(
    `${props.inviterName} te invitó a iEkklesia`,
    <InvitationEmail {...props} />,
  );
}

export function renderPasswordResetEmail(
  props: PasswordResetEmailProps,
): Promise<RenderedEmail> {
  return renderBoth(
    "Restablece tu contraseña",
    <PasswordResetEmail {...props} />,
  );
}
