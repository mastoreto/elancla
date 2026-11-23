import {
  AUDIT_ACTIONS,
  type CreateSermonBody,
  SERMON_SERIES_TITLE_MAX_LENGTH,
  type SermonSnapshot,
} from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import { auditSourceFrom, writeAudit } from "../../../../core/audit";
import type { AuthenticatedContext } from "../../../../core/context";
import {
  InvalidSermonReferenceError,
  listCurrentRevisionRows,
} from "../../../editorial";
import {
  createMinimalSeriesRow,
  findSeriesId,
  listSeriesSlugs,
  type OrganizationSermonConfig,
} from "../../data";
import {
  nextSeriesOrder,
  pickFreeSlug,
  slugifyTitle,
  truncateText,
} from "../../domain";

const FIRST_POSITION = 1;
const SERIES_SLUG_FALLBACK = "series";

export interface ResolvedSeries {
  id: string;
  /** Position the new sermon takes in the series. */
  order: number;
}

async function createNewSeries(
  tx: Prisma.TransactionClient,
  ctx: AuthenticatedContext,
  config: OrganizationSermonConfig,
  newSeriesTitle: string,
): Promise<ResolvedSeries> {
  const { defaultLocale } = config;
  const title = truncateText(newSeriesTitle, SERMON_SERIES_TITLE_MAX_LENGTH);
  const taken = await listSeriesSlugs(tx, ctx.organizationId, defaultLocale);
  const slug = pickFreeSlug(slugifyTitle(title, SERIES_SLUG_FALLBACK), taken);
  const created = await createMinimalSeriesRow(tx, ctx.organizationId, {
    locale: defaultLocale,
    title,
    slug,
  });
  await writeAudit(tx, auditSourceFrom(ctx, ctx.organizationId), {
    action: AUDIT_ACTIONS.sermonSeries.created,
    entity: { type: "sermonSeries", id: created.id },
    after: {
      id: created.id,
      translations: { [defaultLocale]: { title, slug } },
    },
    metadata: { createdWithSermon: true },
  });
  return { id: created.id, order: FIRST_POSITION };
}

async function nextPositionIn(
  organizationId: string,
  seriesId: string,
): Promise<number> {
  const revisions = await listCurrentRevisionRows(organizationId, "SERMON");
  // ponytail: in-memory scan, same as the public reads.
  return nextSeriesOrder(
    revisions.map((row) => row.snapshot as unknown as SermonSnapshot),
    seriesId,
  );
}

/**
 * The series a new sermon goes into, inside the transaction that creates it: an existing one of
 * the organization (400 `invalid_series` otherwise), a minimal new one by title, or none.
 */
export async function resolveSermonSeries(
  tx: Prisma.TransactionClient,
  ctx: AuthenticatedContext,
  config: OrganizationSermonConfig,
  {
    seriesId,
    newSeriesTitle,
  }: Pick<CreateSermonBody, "seriesId" | "newSeriesTitle">,
): Promise<ResolvedSeries | undefined> {
  if (newSeriesTitle !== undefined) {
    return createNewSeries(tx, ctx, config, newSeriesTitle);
  }
  if (seriesId === undefined) return undefined;
  const series = await findSeriesId(tx, ctx.organizationId, seriesId);
  if (!series) {
    throw new InvalidSermonReferenceError(
      "invalid_series",
      "The series does not exist",
    );
  }
  return {
    id: series.id,
    order: await nextPositionIn(ctx.organizationId, series.id),
  };
}
