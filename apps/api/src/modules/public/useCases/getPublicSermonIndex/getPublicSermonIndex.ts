import type { PublicSermonIndexDto } from "@ancla/contracts";
import { toPublicSermonIndexDto } from "../../mappers";
import { loadSermonCorpus } from "../loadSermonCorpus";

/**
 * The sermons home: every published sermon and what the page shows next to them (series,
 * preachers, books). Drafts and paused sermons are absent.
 */
export async function getPublicSermonIndex(input: {
  organizationId: string;
  requestedLocale: string | undefined;
}): Promise<PublicSermonIndexDto> {
  const { entries, ctx } = await loadSermonCorpus(input);
  return toPublicSermonIndexDto({ entries, ctx });
}
