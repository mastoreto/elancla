import {
  blogPostSnapshot,
  type EditorialContentTypeParam,
  eventSnapshot,
  ministrySnapshot,
  PERMISSIONS,
  type Permission,
  sermonSnapshot,
  simplePageSnapshot,
} from "@ancla/contracts";
import type { EditorialContentType, Prisma } from "@ancla/db";
import type { z } from "zod";
import type { Access } from "../../../core/context";
import { blogPostBeforeGoLive, blogPostExists } from "./blogPost";
import {
  eventBeforeGoLive,
  eventExists,
  eventsVisibleTo,
  eventUsersWhoCanSee,
  eventVisibleTo,
} from "./event";
import { ministryBeforeGoLive, ministryExists } from "./ministry";
import { sermonBeforeGoLive, sermonExists } from "./sermon";
import { assertSimplePageSlugsFree, simplePageExists } from "./simplePage";
import { validateSnapshotLocales } from "./validateSnapshotLocales";

export type EditorialPermissionKind = "view" | "edit" | "publish";

export interface OrganizationLocales {
  locales: string[];
  defaultLocale: string;
}

/** What a type's `beforeGoLive` hook sees: the revision about to become the live one. */
export interface GoLiveContext {
  tx: Prisma.TransactionClient;
  organizationId: string;
  entityId: string;
  snapshot: Record<string, unknown>;
  /** The instant of the transition; hooks use it instead of reading the clock (testable). */
  now: Date;
}

export interface EditorialTypeDefinition {
  contentType: EditorialContentType;
  /** Spelled the way the URL does. */
  param: EditorialContentTypeParam;
  /** What the content is called inside an email: "una entrada del blog". */
  label: string;
  permissions: Record<EditorialPermissionKind, Permission>;
  /** The content belongs to a ministry: a ministry-scoped grant only reaches the user's own. */
  ministryScoped: boolean;
  snapshotSchema: z.ZodType<Record<string, unknown>>;
  /** Where the CRM shows this entity, for the links in emails and in the inbox. */
  crmPath(entityId: string): string;
  /** Types whose entity is a row of its own: an id that matches nothing is a 404. */
  entityExists?(
    tx: Prisma.TransactionClient,
    organizationId: string,
    entityId: string,
  ): Promise<boolean>;
  /**
   * Types whose entities are not for every reader (internal events): `false` makes every route on
   * the entity a 404 for this access. Only `event` implements it.
   */
  entityVisibleTo?(
    tx: Prisma.TransactionClient,
    organizationId: string,
    entityId: string,
    access: Access,
  ): Promise<boolean>;
  /** `entityVisibleTo` for many entities at once (the inbox): the ids this access may see. */
  entitiesVisibleTo?(
    tx: Prisma.TransactionClient,
    organizationId: string,
    entityIds: readonly string[],
    access: Access,
  ): Promise<Set<string>>;
  /** Of these users, the ones who may see the entity (who an email may mention it to). */
  usersWhoCanSee?(
    tx: Prisma.TransactionClient,
    organizationId: string,
    entityId: string,
    userIds: readonly string[],
  ): Promise<Set<string>>;
  /** Runs in the transaction of publish, approve and resume; throws to refuse going live. */
  beforeGoLive?(context: GoLiveContext): Promise<void>;
  /** Rules that depend on the organization; a message means the snapshot is a 400. */
  validateSnapshot?(
    snapshot: Record<string, unknown>,
    organization: OrganizationLocales,
  ): string | null;
}

/** Each phase that adopts the workflow adds its type here (and a value to the Prisma enum). */
export const EDITORIAL_TYPES: Record<
  EditorialContentTypeParam,
  EditorialTypeDefinition
> = {
  "blog-post": {
    contentType: "BLOG_POST",
    param: "blog-post",
    label: "una entrada del blog",
    permissions: {
      view: PERMISSIONS.blogPosts.view,
      edit: PERMISSIONS.blogPosts.edit,
      publish: PERMISSIONS.blogPosts.publish,
    },
    ministryScoped: false,
    snapshotSchema: blogPostSnapshot,
    crmPath: (entityId) => `/blog/${entityId}`,
    entityExists: blogPostExists,
    beforeGoLive: blogPostBeforeGoLive,
    validateSnapshot: validateSnapshotLocales,
  },
  ministry: {
    contentType: "MINISTRY",
    param: "ministry",
    label: "el perfil de un ministerio",
    permissions: {
      view: PERMISSIONS.ministryProfile.view,
      edit: PERMISSIONS.ministryProfile.edit,
      publish: PERMISSIONS.ministryProfile.publish,
    },
    ministryScoped: true,
    snapshotSchema: ministrySnapshot,
    crmPath: (entityId) => `/ministries/${entityId}`,
    entityExists: ministryExists,
    beforeGoLive: ministryBeforeGoLive,
    validateSnapshot: validateSnapshotLocales,
  },
  "simple-page": {
    contentType: "SIMPLE_PAGE",
    param: "simple-page",
    label: "una página del sitio",
    permissions: {
      view: PERMISSIONS.pages.view,
      edit: PERMISSIONS.pages.edit,
      publish: PERMISSIONS.pages.publish,
    },
    ministryScoped: false,
    snapshotSchema: simplePageSnapshot,
    crmPath: (entityId) => `/website/pages/${entityId}`,
    entityExists: simplePageExists,
    beforeGoLive: assertSimplePageSlugsFree,
    validateSnapshot: validateSnapshotLocales,
  },
  event: {
    contentType: "EVENT",
    param: "event",
    label: "un evento del calendario",
    permissions: {
      view: PERMISSIONS.events.view,
      edit: PERMISSIONS.events.edit,
      publish: PERMISSIONS.events.publish,
    },
    ministryScoped: false,
    snapshotSchema: eventSnapshot,
    crmPath: (entityId) => `/calendar/events/${entityId}`,
    entityExists: eventExists,
    entityVisibleTo: eventVisibleTo,
    entitiesVisibleTo: eventsVisibleTo,
    usersWhoCanSee: eventUsersWhoCanSee,
    beforeGoLive: eventBeforeGoLive,
    validateSnapshot: validateSnapshotLocales,
  },
  sermon: {
    contentType: "SERMON",
    param: "sermon",
    label: "un sermón",
    permissions: {
      view: PERMISSIONS.sermons.view,
      edit: PERMISSIONS.sermons.edit,
      publish: PERMISSIONS.sermons.publish,
    },
    ministryScoped: false,
    snapshotSchema: sermonSnapshot,
    crmPath: (entityId) => `/sermons/${entityId}`,
    entityExists: sermonExists,
    beforeGoLive: sermonBeforeGoLive,
    validateSnapshot: validateSnapshotLocales,
  },
};

export const EDITORIAL_CONTENT_TYPE_LIST: readonly EditorialTypeDefinition[] =
  Object.values(EDITORIAL_TYPES);

export function findEditorialType(
  param: string,
): EditorialTypeDefinition | undefined {
  return (EDITORIAL_TYPES as Record<string, EditorialTypeDefinition>)[param];
}

export function editorialTypeOf(
  contentType: EditorialContentType,
): EditorialTypeDefinition {
  const found = EDITORIAL_CONTENT_TYPE_LIST.find(
    (definition) => definition.contentType === contentType,
  );
  if (!found) throw new Error(`Unregistered editorial type ${contentType}`);
  return found;
}
