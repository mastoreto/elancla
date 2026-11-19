// Generates TOTP codes with Better Auth's own OTP util (@better-auth/utils/otp) without adding a
// dependency: it is resolved from where better-auth itself resolves it.
import { createRequire } from "node:module";

interface OtpModule {
  createOTP(secret: string): { totp(): Promise<string> };
}
interface Base32Module {
  base32: { decode(value: string): Uint8Array };
}

const betterAuthRequire = createRequire(
  Bun.resolveSync("better-auth", import.meta.dir),
);
const otp = (await import(
  betterAuthRequire.resolve("@better-auth/utils/otp")
)) as OtpModule;
const base32 = (await import(
  betterAuthRequire.resolve("@better-auth/utils/base32")
)) as Base32Module;

/** The current code for the secret inside an `otpauth://` URI (what the QR code carries). */
export async function totpFromUri(totpURI: string): Promise<string> {
  const encoded = new URL(totpURI).searchParams.get("secret");
  if (!encoded) throw new Error("The otpauth URI has no secret");
  const secret = new TextDecoder().decode(base32.base32.decode(encoded));
  return otp.createOTP(secret).totp();
}
