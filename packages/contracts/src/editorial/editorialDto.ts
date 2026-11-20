import { z } from "zod";

const COMMENT_MAX_LENGTH = 2000;
const MAX_IDS_PER_LIST = 50;

/** Content types that go through the workflow, as they appear in the URL. */
export const EDITORIAL_CONTENT_TYPES = ["blog-post", "ministry"] as const;
export const editorialContentTypeParam = z.enum(EDITORIAL_CONTENT_TYPES);
export type EditorialContentTypeParam = z.infer<
  typeof editorialContentTypeParam
>;

/** Lower case on the wire, like `SiteStatus`. `superseded` is the live revision a newer one replaced. */
export const EDITORIAL_STATES = [
  "draft",
  "in_review",
  "changes_requested",
  "published",
  "paused",
  "superseded",
] as const;
export const editorialStateDto = z.enum(EDITORIAL_STATES);
export type EditorialStateDto = z.infer<typeof editorialStateDto>;

export const EDITORIAL_ACTIONS = [
  "saveDraft",
  "submit",
  "publish",
  "approve",
  "requestChanges",
  "pause",
  "resume",
] as const;
export const editorialActionDto = z.enum(EDITORIAL_ACTIONS);
export type EditorialActionDto = z.infer<typeof editorialActionDto>;

const personDto = z.strictObject({ id: z.uuid(), name: z.string() });

export const revisionSummaryDto = z.strictObject({
  id: z.uuid(),
  number: z.number().int(),
  state: editorialStateDto,
  author: personDto,
  reviewer: personDto.nullable(),
  comment: z.string().nullable(),
  createdAt: z.iso.datetime(),
  submittedAt: z.iso.datetime().nullable(),
  decidedAt: z.iso.datetime().nullable(),
  publishedAt: z.iso.datetime().nullable(),
});
export type RevisionSummaryDto = z.infer<typeof revisionSummaryDto>;

export const snapshotSchema = z.record(z.string(), z.unknown());

export const editorialStatusDto = z.strictObject({
  live: revisionSummaryDto.nullable(),
  working: revisionSummaryDto
    .extend({ snapshot: snapshotSchema })
    .strict()
    .nullable(),
  availableActions: z.array(editorialActionDto),
});
export type EditorialStatusDto = z.infer<typeof editorialStatusDto>;

export const saveDraftBody = z.strictObject({ snapshot: snapshotSchema });
export type SaveDraftBody = z.infer<typeof saveDraftBody>;

export const requestChangesBody = z.strictObject({
  comment: z.string().trim().min(1).max(COMMENT_MAX_LENGTH),
});
export type RequestChangesBody = z.infer<typeof requestChangesBody>;

const idList = z.array(z.uuid()).max(MAX_IDS_PER_LIST);

export const updateEditorialSettingsBody = z.strictObject({
  reviewerRoleIds: idList,
  reviewerUserIds: idList,
  mandatoryReviewRoleIds: idList,
  mandatoryReviewUserIds: idList,
});
export type UpdateEditorialSettingsBody = z.infer<
  typeof updateEditorialSettingsBody
>;

export const editorialSettingsDto = z.strictObject({
  contentType: editorialContentTypeParam,
  ...updateEditorialSettingsBody.shape,
});
export type EditorialSettingsDto = z.infer<typeof editorialSettingsDto>;

export const inboxItemDto = z.strictObject({
  revisionId: z.uuid(),
  contentType: editorialContentTypeParam,
  entityId: z.uuid(),
  number: z.number().int(),
  author: personDto,
  comment: z.string().nullable(),
  at: z.iso.datetime(),
  crmPath: z.string(),
});
export type InboxItemDto = z.infer<typeof inboxItemDto>;

export const editorialInboxDto = z.strictObject({
  toReview: z.array(inboxItemDto),
  changesRequested: z.array(inboxItemDto),
});
export type EditorialInboxDto = z.infer<typeof editorialInboxDto>;
