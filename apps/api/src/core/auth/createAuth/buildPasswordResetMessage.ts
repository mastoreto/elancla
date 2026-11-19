import { renderPasswordResetEmail } from "@ancla/emails";
import type { MailMessage } from "../../mail";

const RESET_TOKEN_MINUTES = 60;
const CHURCH_NAME = "Iglesia El Ancla";
const UNKNOWN = "No disponible";
const MAX_DEVICE_LENGTH = 80;

interface PasswordResetMessageInput {
  email: string;
  url: string;
  request: Request | undefined;
}

/** Better Auth's default reset token lifetime is one hour (`resetPasswordTokenExpiresIn`). */
export async function buildPasswordResetMessage({
  email,
  url,
  request,
}: PasswordResetMessageInput): Promise<MailMessage> {
  const userAgent = request?.headers.get("user-agent") ?? UNKNOWN;
  const rendered = await renderPasswordResetEmail({
    churchName: CHURCH_NAME,
    recipientEmail: email,
    resetUrl: url,
    expiresInMinutes: RESET_TOKEN_MINUTES,
    device: userAgent.slice(0, MAX_DEVICE_LENGTH),
    // ponytail: IP geolocation is not available; the template needs a value.
    location: UNKNOWN,
    requestedAt: new Date().toISOString(),
  });
  return { to: email, ...rendered };
}
