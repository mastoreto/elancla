import type { EditorialActionDto } from "@ancla/contracts";
import type { EditorialState } from "@ancla/db";

/**
 * Where each action sends a revision, by the state it is in now (`null` = no revision yet).
 * `resume` acts on the live revision, the rest on the working one. Anything not listed is not
 * allowed. Superseding the previous live revision is the use case's job, not this table's.
 */
const TRANSITIONS: Record<
  EditorialActionDto,
  Partial<Record<EditorialState | "NONE", EditorialState>>
> = {
  saveDraft: {
    NONE: "DRAFT",
    DRAFT: "DRAFT",
    CHANGES_REQUESTED: "DRAFT",
  },
  submit: { DRAFT: "IN_REVIEW" },
  publish: { DRAFT: "PUBLISHED" },
  approve: { IN_REVIEW: "PUBLISHED" },
  requestChanges: { IN_REVIEW: "CHANGES_REQUESTED" },
  // ponytail: no withdraw (IN_REVIEW → DRAFT) for the author; add it if asked.
  pause: { PUBLISHED: "PAUSED" },
  resume: { PAUSED: "PUBLISHED" },
};

export function nextState(
  state: EditorialState | null,
  action: EditorialActionDto,
): EditorialState | null {
  return TRANSITIONS[action][state ?? "NONE"] ?? null;
}
