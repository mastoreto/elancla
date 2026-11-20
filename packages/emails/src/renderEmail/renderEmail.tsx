import {
  InvitationEmail,
  type InvitationEmailProps,
} from "../templates/invitation-email";
import {
  PasswordResetEmail,
  type PasswordResetEmailProps,
} from "../templates/password-reset-email";
import { type RenderedEmail, renderBoth } from "./renderBoth";

export type { RenderedEmail };

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
