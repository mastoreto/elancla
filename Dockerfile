# syntax=docker/dockerfile:1
# Imagen del backoffice iEkklesia (apps/crm, Next.js 16) construida desde el
# monorepo con Bun. Salida `standalone` (ver apps/crm/next.config.mjs).

# ─── Base ────────────────────────────────────────────────────────────────────
FROM oven/bun:1.2.4-debian AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ─── deps: instala dependencias del workspace (capa cacheable) ───────────────
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/crm/package.json apps/crm/
COPY apps/web/package.json apps/web/
COPY packages/auth/package.json packages/auth/
COPY packages/db/package.json packages/db/
COPY packages/content/package.json packages/content/
COPY packages/env/package.json packages/env/
COPY packages/utils/package.json packages/utils/
COPY packages/biome-config/package.json packages/biome-config/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN bun install --frozen-lockfile

# ─── builder: genera Prisma Client y compila el crm ────────────────────────
FROM base AS builder
ENV NODE_ENV=production
# Secreto sólo para que betterAuth() se construya durante el build; el secreto
# real se inyecta en runtime vía variables de entorno (no se hornea en el bundle).
ENV BETTER_AUTH_SECRET="build-time-placeholder-secret-change-me-32chars"
# NEXT_PUBLIC_* se inlinea en build. Vacío → el authClient usa el mismo origin.
ARG NEXT_PUBLIC_BETTER_AUTH_URL=""
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client (engine binario para esta imagen debian).
RUN bun run --filter @ancla/db db:generate
# Build de Next (genera apps/crm/.next/standalone).
RUN bun run --filter crm build

# ─── runner: imagen mínima con la salida standalone ──────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario no-root (la imagen oven/bun trae el usuario `bun`).
USER bun

# server.js + node_modules trazados (incluye @prisma/client y el query engine).
COPY --from=builder --chown=bun:bun /app/apps/crm/.next/standalone ./
# Assets estáticos y públicos (no van en standalone).
COPY --from=builder --chown=bun:bun /app/apps/crm/.next/static ./apps/crm/.next/static
COPY --from=builder --chown=bun:bun /app/apps/crm/public ./apps/crm/public

EXPOSE 3000

# El server.js standalone queda en apps/crm/ por outputFileTracingRoot=raíz.
CMD ["bun", "apps/crm/server.js"]
