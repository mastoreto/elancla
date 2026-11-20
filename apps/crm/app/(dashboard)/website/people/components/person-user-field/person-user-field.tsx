import { BoardSelect } from "@/components/dashboard/board/board-form";
import type { LinkableUser } from "../../types";
import { buildUserOptions, NO_USER_VALUE } from "../../utils/buildUserOptions";

interface PersonUserFieldProps {
  users: readonly LinkableUser[];
  userId: string | null;
  onChange: (userId: string | null) => void;
  disabled: boolean;
}

/** Optional link between the public profile and a CRM account. */
export function PersonUserField({ users, userId, onChange, disabled }: PersonUserFieldProps) {
  return (
    <BoardSelect
      disabled={disabled}
      hint="Opcional. Una cuenta solo puede estar vinculada a una persona."
      id="person-user"
      label="Usuario vinculado"
      onValueChange={(value) => onChange(value === NO_USER_VALUE ? null : value)}
      options={buildUserOptions(users, userId)}
      value={userId ?? NO_USER_VALUE}
    />
  );
}
