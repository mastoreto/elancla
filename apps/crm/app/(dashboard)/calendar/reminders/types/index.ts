/** What the recipients form edits. A role reaches every user that holds it. */
export interface ReminderFormValues {
  recipientRoleIds: string[];
  recipientUserIds: string[];
}

/** The ids the form can offer; `null` when the user cannot list that kind (its ids are kept as they are). */
export interface KnownRecipients {
  roleIds: readonly string[] | null;
  userIds: readonly string[] | null;
}

export interface RecipientOption {
  id: string;
  name: string;
  /** Second line of the option, e.g. the e-mail of a user. */
  hint?: string;
}
