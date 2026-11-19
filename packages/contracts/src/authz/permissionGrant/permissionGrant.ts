import { z } from "zod";
import {
  isGrantSupported,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  PERMISSION_SCOPES,
  type PermissionResource,
} from "../permissionCatalog";

const resourceSchema = z.enum(
  PERMISSION_RESOURCES as [PermissionResource, ...PermissionResource[]],
);

/** One cell of the grid: an action on a resource with its own scope. */
export const permissionGrantSchema = z
  .strictObject({
    resource: resourceSchema,
    action: z.enum(PERMISSION_ACTIONS),
    scope: z.enum(PERMISSION_SCOPES),
  })
  .refine(isGrantSupported, {
    message:
      "The catalog does not support this action or scope on the resource",
  });

/** A role's grid. A resource and action pair can appear only once. */
export const permissionGrantsSchema = z
  .array(permissionGrantSchema)
  .max(PERMISSION_RESOURCES.length * PERMISSION_ACTIONS.length)
  .refine(
    (grants) =>
      new Set(grants.map(({ resource, action }) => `${resource}:${action}`))
        .size === grants.length,
    { message: "A permission can be granted only once per role" },
  );
