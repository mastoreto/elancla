import {
  type EditorialContentTypeParam,
  PERMISSIONS,
  type Permission,
  simplePageSnapshot,
  snapshotSchema,
} from "@ancla/contracts";
import type { EditorialContentType } from "@ancla/db";
import type { z } from "zod";

export type EditorialPermissionKind = "view" | "edit" | "publish";

export interface EditorialTypeDefinition {
  contentType: EditorialContentType;
  /** Spelled the way the URL does. */
  param: EditorialContentTypeParam;
  /** What the content is called inside an email: "una entrada del blog". */
  label: string;
  permissions: Record<EditorialPermissionKind, Permission>;
  /** The content belongs to a ministry: a ministry-scoped grant only reaches the user's own. */
  ministryScoped: boolean;
  /** ponytail: 1.4/1.5 replace it with the real content schema. */
  snapshotSchema: z.ZodType<Record<string, unknown>>;
  /** Where the CRM shows this entity, for the links in emails and in the inbox. */
  crmPath(entityId: string): string;
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
    snapshotSchema,
    crmPath: () => "/blog",
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
    snapshotSchema,
    crmPath: (entityId) => `/ministries/${entityId}`,
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
