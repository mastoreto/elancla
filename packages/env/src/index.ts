// @ancla/env — validación centralizada de variables de entorno (t3-env).
// SCAFFOLD: punto único para validar el .env del monorepo. Ampliá el schema y
// consumí `env` desde las apps/paquetes a medida que aparezcan secretos reales.
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  server: {
    APP_ENV: z.enum(["local", "development", "production"]).default("local"),
    // Requerida por @ancla/db cuando el CMS custom esté conectado.
    DATABASE_URL: z.string().url().optional(),
    // Better Auth (apps/admin). Requeridas en runtime del backoffice.
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
  },
  client: {
    // URL base del admin para el authClient (Better Auth en el browser).
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    APP_ENV: process.env.APP_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },
  emptyStringAsUndefined: true,
});
