import { type MediaPurpose, mediaPurposeOf } from "@ancla/contracts";
import { scopeOf } from "../../../../core/authz";
import type { Access } from "../../../../core/context";
import { ForbiddenError } from "../../../../core/errors";

/** The permission that governs an upload is the one of its purpose, so it is checked here. */
export function assertCanUpload(access: Access, purpose: MediaPurpose): void {
  if (scopeOf(access, mediaPurposeOf(purpose).uploadPermission) === null) {
    throw new ForbiddenError();
  }
}
