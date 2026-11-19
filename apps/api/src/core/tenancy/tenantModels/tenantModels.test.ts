import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@ancla/db";
import { TENANT_MODELS } from "./tenantModels";

interface RuntimeDataModel {
  models: Record<string, { dbName: string | null; fields: { name: string }[] }>;
}

afterAll(() => db.$disconnect());

describe("TENANT_MODELS", () => {
  const { models } = (db as unknown as { _runtimeDataModel: RuntimeDataModel })
    ._runtimeDataModel;
  const withOrganizationId = Object.entries(models).filter(([, model]) =>
    model.fields.some((field) => field.name === "organizationId"),
  );

  test("matches the Prisma models that have organizationId", () => {
    expect([...TENANT_MODELS].sort()).toEqual(
      withOrganizationId.map(([name]) => name).sort(),
    );
  });

  test("matches the database tables that have an organizationId column", async () => {
    const rows = await db.$queryRaw<{ name: string }[]>`
      SELECT table_name AS name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'organizationId'
    `;
    const expected = withOrganizationId.map(([, model]) => model.dbName);
    expect(rows.map((row) => row.name).sort()).toEqual(
      expected.sort() as string[],
    );
  });
});
