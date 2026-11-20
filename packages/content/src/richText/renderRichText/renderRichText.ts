import { renderDocument } from "../htmlDocument";

/**
 * HTML for a rich text document (simple pages). Anything that is not a valid `doc` renders as an
 * empty string. The output is meant for `set:html`: it is the only place that markup is built.
 */
export function renderRichText(doc: unknown): string {
  return renderDocument(doc);
}
