import { db } from "@ancla/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins/two-factor";
import type { GoogleOptions } from "better-auth/social-providers";
import type { Mailer } from "../../mail";
import { freshSessionGuard } from "../freshSessionGuard";
import { readGooglePicture } from "../googlePicture";
import { assertSignUpAllowed, markInvitationAccepted } from "../invitationGate";
import {
  SESSION_FRESH_SECONDS,
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFRESH_SECONDS,
} from "../sessionPolicy";
import { socialTwoFactorGuard } from "../socialTwoFactorGuard";
import { buildPasswordResetMessage } from "./buildPasswordResetMessage";

const MIN_PASSWORD_LENGTH = 12;
const TOTP_ISSUER = "El Ancla";
const CREDENTIAL_SIGN_UP_PATH = "/sign-up/email";
const GOOGLE_PROVIDER_ID = "google";

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  /** Test seam: replaces Google's id-token verification and profile lookup (no network). */
  overrides?: Pick<GoogleOptions, "verifyIdToken" | "getUserInfo">;
}

export interface CreateAuthOptions {
  secret: string;
  /** Public origin of the CRM; Better Auth is served under `${baseURL}/api/auth`. */
  baseURL: string;
  crmOrigin: string;
  mailer: Mailer;
  /** Omitted when Google is not configured: the provider is then disabled. */
  google?: GoogleCredentials;
  /** Enabled by default; the HTTP-level tests of the shared instance switch it off. */
  rateLimitEnabled?: boolean;
}

/** Better Auth for El Ancla. A factory so tests can inject a fake mailer and fake Google. */
export function createAuth(options: CreateAuthOptions) {
  const {
    secret,
    baseURL,
    crmOrigin,
    mailer,
    google,
    rateLimitEnabled = true,
  } = options;
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins: [crmOrigin],
    database: prismaAdapter(db, { provider: "postgresql" }),
    advanced: {
      database: {
        // Let Prisma apply the schema default (UUIDv7) instead of Better Auth's random ids.
        generateId: false,
      },
    },
    session: {
      expiresIn: SESSION_MAX_AGE_SECONDS,
      updateAge: SESSION_REFRESH_SECONDS,
      freshAge: SESSION_FRESH_SECONDS,
    },
    rateLimit: { enabled: rateLimitEnabled, storage: "database" },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      // The invitation endpoint signs the user up and the person then logs in.
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }, request) => {
        await mailer.send(
          await buildPasswordResetMessage({ email: user.email, url, request }),
        );
      },
    },
    socialProviders: google
      ? {
          google: {
            clientId: google.clientId,
            clientSecret: google.clientSecret,
            ...google.overrides,
          },
        }
      : {},
    account: {
      accountLinking: {
        // Linking is explicit only: `linkSocial` while signed in, same email.
        disableImplicitLinking: true,
        allowDifferentEmails: false,
        allowUnlinkingAll: false,
      },
    },
    user: {
      additionalFields: {
        // Temporary flat role (admin|viewer), copied from the invitation until phase 0.4.
        role: {
          type: "string",
          required: false,
          input: false,
          defaultValue: "viewer",
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, context) => {
            const email = user.email.toLowerCase();
            const { role } = await assertSignUpAllowed({
              email,
              emailVerified: user.emailVerified === true,
              isCredentialSignUp: context?.path === CREDENTIAL_SIGN_UP_PATH,
            });
            return { data: { ...user, email, role, emailVerified: true } };
          },
          after: async (user) => {
            await markInvitationAccepted(user.email);
          },
        },
      },
      account: {
        create: {
          // Google's profile picture is kept when linking, unless the user already has one.
          after: async (account) => {
            if (account.providerId !== GOOGLE_PROVIDER_ID) return;
            const picture = readGooglePicture(account.idToken);
            if (!picture) return;
            await db.user.updateMany({
              where: { id: account.userId, image: null },
              data: { image: picture },
            });
          },
        },
      },
    },
    plugins: [
      // Passwordless: a Google-only user has no password to confirm; anyone with one must send it.
      twoFactor({ issuer: TOTP_ISSUER, allowPasswordless: true }),
      socialTwoFactorGuard({ crmOrigin }),
      freshSessionGuard(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
