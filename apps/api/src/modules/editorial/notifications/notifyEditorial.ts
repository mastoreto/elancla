import { db } from "@ancla/db";
import {
  type EditorialNoticeVariant,
  renderEditorialNoticeEmail,
} from "@ancla/emails";
import { getApiEnv } from "../../../core/env";
import type { Mailer } from "../../../core/mail";
import {
  findAdminUsers,
  findConfiguredReviewers,
  findOrganizationName,
  findReviewSettings,
  findUserRecipient,
  type Recipient,
  type RevisionRow,
} from "../data";
import type { EditorialTypeDefinition } from "../registry";

export interface EditorialNotice {
  mailer: Mailer;
  organizationId: string;
  definition: EditorialTypeDefinition;
  variant: EditorialNoticeVariant;
  /** The revision after the transition. */
  revision: RevisionRow;
  /** Who did it. */
  actor: { id: string; name: string };
}

function withoutUser(recipients: Recipient[], userId: string): Recipient[] {
  return recipients.filter((recipient) => recipient.id !== userId);
}

/** Reviewers of the type except the sender; with none left, the admins take their place. */
async function reviewersToNotify(
  notice: EditorialNotice,
): Promise<Recipient[]> {
  const { organizationId, definition, actor } = notice;
  const settings = await findReviewSettings(
    db,
    organizationId,
    definition.contentType,
  );
  const reviewers = withoutUser(
    await findConfiguredReviewers(organizationId, settings),
    actor.id,
  );
  if (reviewers.length > 0) return reviewers;
  return withoutUser(await findAdminUsers(organizationId), actor.id);
}

async function recipientsOf(notice: EditorialNotice): Promise<Recipient[]> {
  if (notice.variant === "submitted") return reviewersToNotify(notice);
  const author = await findUserRecipient(notice.revision.authorId);
  return author ? [author] : [];
}

async function sendTo(
  recipient: Recipient,
  notice: EditorialNotice,
  churchName: string,
) {
  const { definition, revision, variant, actor } = notice;
  const rendered = await renderEditorialNoticeEmail({
    variant,
    churchName,
    recipientEmail: recipient.email,
    contentLabel: definition.label,
    actorName: actor.name,
    comment: variant === "changesRequested" ? revision.comment : null,
    actionUrl: `${getApiEnv().CRM_ORIGIN}${definition.crmPath(revision.entityId)}`,
  });
  await notice.mailer.send({ to: recipient.email, ...rendered });
}

/**
 * Emails the people the transition concerns. It runs after the transaction committed and is best
 * effort: a mail that fails is logged and never undoes or fails the change.
 */
export async function notifyEditorial(notice: EditorialNotice): Promise<void> {
  try {
    const [recipients, churchName] = await Promise.all([
      recipientsOf(notice),
      findOrganizationName(notice.organizationId),
    ]);
    for (const recipient of recipients) {
      try {
        await sendTo(recipient, notice, churchName);
      } catch (error) {
        console.error("Editorial notice not sent", { to: recipient.id, error });
      }
    }
  } catch (error) {
    console.error("Editorial notice could not be prepared", { error });
  }
}
