// Database-level guarantees from docs/implementation/plans/0.1-db-rework.md. They read the live
// catalog, so a future migration that breaks a convention fails here.
import { afterAll, describe, expect, test } from "bun:test";
import { db } from "../../src";

const MIGRATIONS_TABLE = "_prisma_migrations";
/** Tables that are not tenant data: Better Auth core and plugin tables, the tenant itself, Prisma bookkeeping. */
const TABLES_WITHOUT_TENANT = new Set([
  MIGRATIONS_TABLE,
  "organizations",
  "users",
  "sessions",
  "accounts",
  "verifications",
  "two_factors",
  "rate_limits",
  // Children reach the tenant through their parent row.
  "site_settings_translations",
  "role_permissions",
  "user_roles",
  "user_ministries",
]);
/** Float columns that are not money. */
const ALLOWED_FLOAT_COLUMNS = new Set([
  "site_settings.geoLat",
  "site_settings.geoLng",
]);
/** Tables whose primary key is composite by design. */
const COMPOSITE_PK_TABLES = new Set([
  MIGRATIONS_TABLE,
  "document_sequences",
  "role_permissions",
  "user_roles",
  "user_ministries",
]);

async function applicationTables(): Promise<string[]> {
  const rows = await db.$queryRaw<{ name: string }[]>`
    SELECT c.relname AS name FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname <> ${MIGRATIONS_TABLE}
  `;
  return rows.map((row) => row.name);
}

afterAll(() => db.$disconnect());

describe("schema invariants", () => {
  test("every application table has RLS with only the app_runtime policy", async () => {
    const rows = await db.$queryRaw<
      { name: string; rls: boolean; roles: string[] | null }[]
    >`
      SELECT c.relname AS name, c.relrowsecurity AS rls,
        (SELECT array_agg(DISTINCT r.rolname::text) FROM pg_policy p
           JOIN pg_roles r ON r.oid = ANY (p.polroles) WHERE p.polrelid = c.oid) AS roles
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname <> ${MIGRATIONS_TABLE}
    `;
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect({ table: row.name, rls: row.rls, roles: row.roles }).toEqual({
        table: row.name,
        rls: true,
        roles: ["app_runtime"],
      });
    }
  });

  test("the runtime role cannot change the schema", async () => {
    // PrismaPromise is lazy and not a native Promise; wrap it so the call actually runs.
    await expect(
      Promise.resolve(db.$executeRaw`CREATE TABLE should_not_exist (id int)`),
    ).rejects.toThrow();
  });

  test("every domain table carries organizationId", async () => {
    const tables = await applicationTables();
    const withTenant = await db.$queryRaw<{ name: string }[]>`
      SELECT table_name AS name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'organizationId'
    `;
    const tenantTables = new Set(withTenant.map((row) => row.name));
    const missing = tables.filter(
      (table) => !(TABLES_WITHOUT_TENANT.has(table) || tenantTables.has(table)),
    );
    expect(missing).toEqual([]);
  });

  test("no floating point columns outside the allowlist (money is Decimal)", async () => {
    const rows = await db.$queryRaw<{ column: string }[]>`
      SELECT table_name || '.' || column_name AS column FROM information_schema.columns
      WHERE table_schema = 'public' AND data_type IN ('double precision', 'real')
    `;
    const unexpected = rows
      .map((row) => row.column)
      .filter((c) => !ALLOWED_FLOAT_COLUMNS.has(c));
    expect(unexpected).toEqual([]);
  });

  test("every single-column primary key is a UUID", async () => {
    const rows = await db.$queryRaw<
      { name: string; type: string; columns: number }[]
    >`
      SELECT tc.table_name AS name, MIN(c.data_type) AS type, COUNT(*)::int AS columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage k
        ON k.constraint_name = tc.constraint_name AND k.table_schema = tc.table_schema
      JOIN information_schema.columns c
        ON c.table_schema = k.table_schema AND c.table_name = k.table_name
        AND c.column_name = k.column_name
      WHERE tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'
      GROUP BY tc.table_name
    `;
    const nonUuid = rows
      .filter((row) => !COMPOSITE_PK_TABLES.has(row.name))
      .filter((row) => row.columns !== 1 || row.type !== "uuid")
      .map((row) => row.name);
    expect(nonUuid).toEqual([]);
  });
});
