import { Prisma, type PrismaClient } from "@ancla/db";
import { TENANT_MODELS } from "../tenantModels";

type Args = Record<string, unknown>;

const WHERE_OPERATIONS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "delete",
  "deleteMany",
]);
const CREATE_OPERATIONS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
]);

function scopeWhere(args: Args, organizationId: string): Args {
  return {
    ...args,
    where: { ...(args.where as Args | undefined), organizationId },
  };
}

function scopeData(data: unknown, organizationId: string): unknown {
  if (Array.isArray(data))
    return data.map((row) => ({ ...row, organizationId }));
  return { ...(data as Args), organizationId };
}

/** A tenant row can never be moved to another organization through an update. */
function withoutTenantChange(args: Args): Args {
  const { organizationId: _ignored, ...data } = (args.data ?? {}) as Args;
  return { ...args, data };
}

function scopeArgs(
  operation: string,
  args: Args,
  organizationId: string,
): Args {
  if (WHERE_OPERATIONS.has(operation)) {
    const scoped = scopeWhere(args, organizationId);
    return operation.startsWith("update")
      ? withoutTenantChange(scoped)
      : scoped;
  }
  if (CREATE_OPERATIONS.has(operation)) {
    return { ...args, data: scopeData(args.data, organizationId) };
  }
  if (operation === "upsert") {
    return {
      ...scopeWhere(args, organizationId),
      create: scopeData(args.create, organizationId),
      update: withoutTenantChange({ data: args.update }).data,
    };
  }
  // Fail closed: an operation we do not know how to scope must not run unscoped.
  throw new Error(
    `Tenant scoping does not support the "${operation}" operation`,
  );
}

function tenantExtension(organizationId: string) {
  return Prisma.defineExtension({
    name: "tenant-scope",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);
          return query(
            scopeArgs(operation, args as Args, organizationId) as typeof args,
          );
        },
      },
    },
  });
}

function extend(client: PrismaClient, organizationId: string) {
  return client.$extends(tenantExtension(organizationId));
}

export type TenantDb = ReturnType<typeof extend>;

/**
 * Prisma client whose tenant models are always filtered by, and created under, `organizationId`.
 * ponytail: only top-level operations are scoped; nested `include`/relation writes rely on the
 * repository passing `organizationId` explicitly (backend.md, query standard 1).
 */
export function forOrganization(
  client: PrismaClient,
  organizationId: string,
): TenantDb {
  return extend(client, organizationId);
}
