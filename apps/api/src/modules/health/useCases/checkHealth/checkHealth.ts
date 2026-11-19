import type { HealthDto } from "@ancla/contracts";
import type { PrismaClient } from "@ancla/db";

/**
 * "degraded" instead of an error when the database does not answer: a health probe must always
 * be able to say something, and it exposes no detail.
 */
export async function checkHealth(db: PrismaClient): Promise<HealthDto> {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "health.database_unreachable",
        name: error instanceof Error ? error.name : "UnknownError",
      }),
    );
    return { status: "degraded" };
  }
}
