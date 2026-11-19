import { AUDIT_OUTCOMES, type AuditOutcome } from "@ancla/contracts";

export interface AuditFilters {
  action?: string;
  outcome?: AuditOutcome;
  actor?: string;
  /** `YYYY-MM-DD` as typed in the date inputs. */
  from?: string;
  to?: string;
  cursor?: string;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const END_OF_DAY = "T23:59:59.999Z";
const START_OF_DAY = "T00:00:00.000Z";

function firstValue(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim() || undefined;
}

/** Reads the filters from the URL; anything malformed is dropped instead of reaching the API. */
export function readAuditFilters(params: RawSearchParams): AuditFilters {
  const outcome = firstValue(params.outcome);
  const from = firstValue(params.from);
  const to = firstValue(params.to);
  return {
    action: firstValue(params.action),
    outcome: AUDIT_OUTCOMES.find((candidate) => candidate === outcome),
    actor: firstValue(params.actor),
    from: from && DATE_ONLY.test(from) ? from : undefined,
    to: to && DATE_ONLY.test(to) ? to : undefined,
    cursor: firstValue(params.cursor),
  };
}

/** The query `GET /audit` takes. ponytail: whole days are read as UTC, not Montevideo time. */
export function toApiQuery(filters: AuditFilters, limit: number): Record<string, string> {
  const entries: [string, string | undefined][] = [
    ["limit", String(limit)],
    ["cursor", filters.cursor],
    ["action", filters.action],
    ["outcome", filters.outcome],
    ["actor", filters.actor],
    ["from", filters.from ? `${filters.from}${START_OF_DAY}` : undefined],
    ["to", filters.to ? `${filters.to}${END_OF_DAY}` : undefined],
  ];
  return Object.fromEntries(entries.filter((entry): entry is [string, string] => !!entry[1]));
}

/** A link to this page with these filters (and, optionally, a cursor for the next page). */
export function auditHref(basePath: string, filters: AuditFilters, cursor?: string): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, cursor })) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
