import { app } from "@ancla/api";
import { handle } from "hono/vercel";

// Hono API mounted under /api. More specific routes (app/api/auth/[...all]) take precedence.
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
