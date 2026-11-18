// @ancla/auth — configuración server de Better Auth (adaptador Prisma).
// Consumida por apps/crm (route handler + checks de sesión server-side).
import { db } from "@ancla/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      // Let Prisma apply the schema default (UUIDv7) instead of Better Auth's random ids.
      generateId: false,
    },
  },
  user: {
    additionalFields: {
      // Rol de la app (admin|treasurer|viewer). input:false → no se asigna en
      // el signup público; se setea por seed/administración.
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "viewer",
      },
    },
  },
});

export type Auth = typeof auth;
export type Session = Auth["$Infer"]["Session"];
