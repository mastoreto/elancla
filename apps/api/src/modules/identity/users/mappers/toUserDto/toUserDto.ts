import type { UserDto } from "@ancla/contracts";
import type { UserRow } from "../../data";

export function toUserDto(row: UserRow): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    roles: row.userRoles.map(({ role }) => role),
    ministries: row.userMinistries.map(({ ministry }) => ministry),
    lastAccessAt: row.sessions[0]?.createdAt.toISOString() ?? null,
  };
}
