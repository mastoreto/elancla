import type { Page, PageQuery, UserDto } from "@ancla/contracts";
import { toPage } from "../../../../../core/http";
import { listUserRows } from "../../data";
import { toUserDto } from "../../mappers";

export async function listUsers(query: PageQuery): Promise<Page<UserDto>> {
  const page = toPage(await listUserRows(query), query.limit);
  return { items: page.items.map(toUserDto), nextCursor: page.nextCursor };
}
