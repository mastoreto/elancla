import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

// En el monorepo, bun hoistea `next` a node_modules de la raíz. Apuntamos el
// root de Turbopack a la raíz del monorepo para que Next resuelva el workspace.
const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// Carga el .env raíz del monorepo (no sobreescribe lo ya inyectado, p. ej. por
// docker-compose; si no existe, se ignora). Evita exportar DATABASE_URL/BETTER_AUTH_*
// a mano al correr el admin en el host.
loadEnv({ path: resolve(monorepoRoot, ".env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Salida autocontenida para Docker (server.js + node_modules trazados).
  output: "standalone",
  // En el monorepo, el tracing debe partir de la raíz para incluir los paquetes
  // del workspace (@ancla/*) y Prisma.
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
