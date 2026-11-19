import { afterAll, describe, expect, test } from "bun:test";
import { AUDIT_ACTIONS } from "@ancla/contracts";
import { db } from "@ancla/db";
import { auditRowsOf } from "../../../../test/support/auditRows";
import { withTransaction } from "../../db";
import { resolveOrganizationId } from "../../tenancy";
import type { AuditSource } from "../auditSource";
import { REDACTED } from "../redact";
import { writeAudit } from "./writeAudit";

afterAll(() => db.$disconnect());

async function sourceWithRequestId(): Promise<AuditSource> {
  return {
    organizationId: await resolveOrganizationId(),
    actor: { id: null, label: "writeaudit-test" },
    requestId: `test-${crypto.randomUUID()}`,
    ip: "10.9.9.9",
    userAgent: "bun-test",
  };
}

describe("writeAudit", () => {
  test("stores who, from where and what, redacting secrets", async () => {
    const source = await sourceWithRequestId();
    await writeAudit(db, source, {
      action: AUDIT_ACTIONS.role.created,
      entity: { type: "role", id: "r-1" },
      after: { name: "Tesorero", tokenHash: "must-not-be-stored" },
      reason: "because",
    });
    const [row] = await auditRowsOf({ requestId: source.requestId as string });
    expect(row).toMatchObject({
      action: "role.created",
      actorLabel: "writeaudit-test",
      actorId: null,
      entityType: "role",
      entityId: "r-1",
      outcome: "success",
      ip: "10.9.9.9",
      userAgent: "bun-test",
      reason: "because",
    });
    expect(row?.after).toEqual({ name: "Tesorero", tokenHash: REDACTED });
  });

  test("a rolled-back mutation leaves no record, a committed one leaves it", async () => {
    const rolledBack = await sourceWithRequestId();
    await withTransaction(db, async (tx) => {
      await writeAudit(tx, rolledBack, {
        action: AUDIT_ACTIONS.role.updated,
      });
      throw new Error("the mutation failed");
    }).catch(() => undefined);
    expect(
      await auditRowsOf({ requestId: rolledBack.requestId as string }),
    ).toHaveLength(0);

    const committed = await sourceWithRequestId();
    await withTransaction(db, (tx) =>
      writeAudit(tx, committed, { action: AUDIT_ACTIONS.role.updated }),
    );
    expect(
      await auditRowsOf({ requestId: committed.requestId as string }),
    ).toHaveLength(1);
  });

  test("the runtime role cannot rewrite or erase history", async () => {
    const source = await sourceWithRequestId();
    await writeAudit(db, source, { action: AUDIT_ACTIONS.role.created });
    const where = { requestId: source.requestId as string };

    // PrismaPromise is lazy and not a native Promise: wrap it so the call actually runs.
    await expect(
      Promise.resolve(
        db.auditLog.updateMany({ where, data: { action: "tampered" } }),
      ),
    ).rejects.toThrow();
    await expect(
      Promise.resolve(db.auditLog.deleteMany({ where })),
    ).rejects.toThrow();
    await expect(
      Promise.resolve(db.$executeRaw`TRUNCATE TABLE audit_logs`),
    ).rejects.toThrow();
    expect(await auditRowsOf(where)).toHaveLength(1);
  });
});
