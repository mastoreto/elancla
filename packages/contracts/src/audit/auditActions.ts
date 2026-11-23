/**
 * Every event the audit trail can hold. Reference an action only through `AUDIT_ACTIONS`
 * (`AUDIT_ACTIONS.role.created`), never by writing its string.
 */
export const AUDIT_ACTIONS = {
  auth: {
    loginSucceeded: "auth.login.succeeded",
    loginFailed: "auth.login.failed",
    /** Right password, second factor still pending (no session yet). */
    loginTwoFactorRequired: "auth.login.twoFactorRequired",
    twoFactorVerified: "auth.twoFactor.verified",
    twoFactorFailed: "auth.twoFactor.failed",
    twoFactorEnabled: "auth.twoFactor.enabled",
    twoFactorDisabled: "auth.twoFactor.disabled",
    backupCodeUsed: "auth.backupCode.used",
    backupCodeFailed: "auth.backupCode.failed",
    passwordResetRequested: "auth.password.reset.requested",
    passwordResetCompleted: "auth.password.reset.completed",
    passwordChanged: "auth.password.changed",
    passwordCreated: "auth.password.created",
    accountLinked: "auth.account.linked",
  },
  permission: { denied: "permission.denied" },
  role: {
    created: "role.created",
    updated: "role.updated",
    deleted: "role.deleted",
  },
  user: {
    rolesChanged: "user.roles.changed",
    ministriesChanged: "user.ministries.changed",
  },
  invitation: {
    created: "invitation.created",
    resent: "invitation.resent",
    revoked: "invitation.revoked",
    accepted: "invitation.accepted",
  },
  siteApiKey: {
    created: "siteApiKey.created",
    revoked: "siteApiKey.revoked",
  },
  editorial: {
    draftSaved: "editorial.draftSaved",
    submitted: "editorial.submitted",
    published: "editorial.published",
    approved: "editorial.approved",
    changesRequested: "editorial.changesRequested",
    paused: "editorial.paused",
    resumed: "editorial.resumed",
    settingsUpdated: "editorial.settingsUpdated",
  },
  site: { settingsUpdated: "site.settingsUpdated" },
  personProfile: {
    created: "personProfile.created",
    updated: "personProfile.updated",
    deleted: "personProfile.deleted",
  },
  visit: { updated: "visit.updated" },
  simplePage: { created: "simplePage.created" },
  post: { created: "post.created" },
  category: {
    created: "category.created",
    updated: "category.updated",
    deleted: "category.deleted",
  },
  ministry: {
    created: "ministry.created",
    settingsUpdated: "ministry.settingsUpdated",
    leadersUpdated: "ministry.leadersUpdated",
    landingUpdated: "ministry.landingUpdated",
  },
  ministryCategory: {
    created: "ministryCategory.created",
    updated: "ministryCategory.updated",
    deleted: "ministryCategory.deleted",
  },
  scheduleSet: {
    created: "scheduleSet.created",
    updated: "scheduleSet.updated",
    deleted: "scheduleSet.deleted",
  },
  recurringActivity: {
    created: "recurringActivity.created",
    updated: "recurringActivity.updated",
    deleted: "recurringActivity.deleted",
  },
  scheduleException: {
    created: "scheduleException.created",
    updated: "scheduleException.updated",
    deleted: "scheduleException.deleted",
  },
  place: {
    created: "place.created",
    updated: "place.updated",
    deleted: "place.deleted",
  },
  event: {
    created: "event.created",
    settingsUpdated: "event.settingsUpdated",
    deleted: "event.deleted",
  },
  calendarYear: {
    created: "calendarYear.created",
    published: "calendarYear.published",
    copied: "calendarYear.copied",
  },
  activityReview: { confirmed: "activityReview.confirmed" },
  calendarReminder: {
    settingsUpdated: "calendarReminder.settingsUpdated",
    sent: "calendarReminder.sent",
  },
  sermon: {
    created: "sermon.created",
    imported: "sermon.imported",
    deleted: "sermon.deleted",
    platformRefreshed: "sermon.platformRefreshed",
  },
  sermonSeries: {
    created: "sermonSeries.created",
    updated: "sermonSeries.updated",
    deleted: "sermonSeries.deleted",
    imported: "sermonSeries.imported",
  },
  series: {
    created: "series.created",
    updated: "series.updated",
    deleted: "series.deleted",
  },
  media: {
    uploadRequested: "media.upload.requested",
    finalized: "media.finalized",
    /** The bytes failed verification (type, size): object and row were deleted. */
    rejected: "media.rejected",
    downloadIssued: "media.download.issued",
    /** A stale pending upload removed by the cron job. */
    purged: "media.purged",
  },
} as const;

type ActionGroups = typeof AUDIT_ACTIONS;
export type AuditAction = {
  [Group in keyof ActionGroups]: ActionGroups[Group][keyof ActionGroups[Group]];
}[keyof ActionGroups];

export const AUDIT_OUTCOMES = ["success", "denied", "failure"] as const;
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];
