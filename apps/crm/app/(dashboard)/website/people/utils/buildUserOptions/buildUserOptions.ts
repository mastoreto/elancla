import type { BoardSelectOption } from "@/components/dashboard/board/board-form";
import type { LinkableUser } from "../../types";

/** Select value for "no linked user": a select cannot hold an empty string. */
export const NO_USER_VALUE = "none";

const NO_USER_LABEL = "Sin usuario vinculado";
const UNLISTED_USER_LABEL = "Usuario vinculado";

/**
 * "No user" first, then the users. A linked user missing from the list (the role cannot list
 * users, or the list was cut) still appears, so the select never shows a blank value.
 */
export function buildUserOptions(
  users: readonly LinkableUser[],
  linkedUserId: string | null,
): BoardSelectOption[] {
  const options: BoardSelectOption[] = [
    { value: NO_USER_VALUE, label: NO_USER_LABEL },
    ...users.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` })),
  ];
  if (linkedUserId && !users.some((user) => user.id === linkedUserId)) {
    options.push({ value: linkedUserId, label: UNLISTED_USER_LABEL });
  }
  return options;
}
