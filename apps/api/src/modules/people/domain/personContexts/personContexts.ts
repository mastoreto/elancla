import type { EditablePersonContext, PersonContext } from "@ancla/contracts";
import type { PersonContext as DbPersonContext } from "@ancla/db";

/** The contracts spell contexts in kebab-case; the database enum is SCREAMING_SNAKE. */
export const CONTEXT_TO_DB: Record<PersonContext, DbPersonContext> = {
  team: "TEAM",
  "blog-author": "BLOG_AUTHOR",
  preacher: "PREACHER",
  "ministry-leader": "MINISTRY_LEADER",
};

export const CONTEXT_FROM_DB: Record<DbPersonContext, PersonContext> = {
  TEAM: "team",
  BLOG_AUTHOR: "blog-author",
  PREACHER: "preacher",
  MINISTRY_LEADER: "ministry-leader",
};

/** The contexts the people CRM edits: ministry leadership belongs to its ministry. */
export const EDITABLE_CONTEXT_FROM_DB: Partial<
  Record<DbPersonContext, EditablePersonContext>
> = {
  TEAM: "team",
  BLOG_AUTHOR: "blog-author",
  PREACHER: "preacher",
};
