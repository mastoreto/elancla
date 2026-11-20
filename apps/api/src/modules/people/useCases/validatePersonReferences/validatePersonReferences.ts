import type { UpsertPersonProfileBody } from "@ancla/contracts";
import type { Prisma } from "@ancla/db";
import {
  ConflictError,
  ValidationError,
  type ValidationIssue,
} from "../../../../core/errors";
import {
  findOrganizationLocaleConfig,
  isOrganizationMember,
  isReadyContentImage,
  isUserLinkedElsewhere,
} from "../../data";

function disabledLocaleIssues(
  body: UpsertPersonProfileBody,
  enabledLocales: readonly string[],
): ValidationIssue[] {
  const used: { path: string; locale: string }[] = [
    ...Object.keys(body.translations).map((locale) => ({
      path: `translations.${locale}`,
      locale,
    })),
    ...body.roles.flatMap((role, index) =>
      Object.keys(role.translations).map((locale) => ({
        path: `roles.${index}.translations.${locale}`,
        locale,
      })),
    ),
  ];
  return used
    .filter(({ locale }) => !enabledLocales.includes(locale))
    .map(({ path, locale }) => ({
      path,
      message: `${locale} is not an enabled language`,
    }));
}

/**
 * Everything the body points at must exist and belong to the organization: the enabled locales,
 * the photo (a ready content image) and the linked user (a member who has no other profile).
 */
export async function validatePersonReferences(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    body: UpsertPersonProfileBody;
    /** The profile being replaced, so it does not conflict with itself. */
    exceptId?: string;
  },
): Promise<void> {
  const { organizationId, body, exceptId } = input;
  const organization = await findOrganizationLocaleConfig(tx, organizationId);
  const issues = disabledLocaleIssues(body, organization?.locales ?? []);

  if (
    body.photoId &&
    !(await isReadyContentImage(tx, organizationId, body.photoId))
  ) {
    issues.push({
      path: "photoId",
      message: "The photo must be a finished content image of the organization",
    });
  }
  if (
    body.userId &&
    !(await isOrganizationMember(tx, organizationId, body.userId))
  ) {
    issues.push({
      path: "userId",
      message: "The user does not belong to the organization",
    });
  }
  if (issues.length > 0) {
    throw new ValidationError("The profile references invalid data", issues);
  }
  if (
    body.userId &&
    (await isUserLinkedElsewhere(tx, {
      organizationId,
      userId: body.userId,
      exceptId,
    }))
  ) {
    throw new ConflictError("That user already has a profile");
  }
}
