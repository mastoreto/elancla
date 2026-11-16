// @ancla/db — cliente Prisma compartido (singleton).
// SCAFFOLD: el cliente sólo existe tras `bun run db:generate`. Hasta entonces
// este import fallará en tiempo de ejecución; ninguna app lo consume todavía.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export * from "@prisma/client";
