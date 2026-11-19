import type { ReactNode } from "react";
import { requireRoutePermission } from "@/lib/authz/requireRoutePermission";

// Section guard: 404 unless the person's roles allow this section.
/** biome-ignore lint/style/noDefaultExport: Next.js App Router layout files require default exports. */
export default async function SectionLayout({ children }: { children: ReactNode }) {
  await requireRoutePermission("receipts");
  return children;
}
