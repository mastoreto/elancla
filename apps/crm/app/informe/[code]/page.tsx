import type { Metadata } from "next";
import {
  getAssemblyReportByCode,
  getPublicAccessState,
} from "@/app/(dashboard)/assembly/utils/assembly-access";
import { LocationGate, PublicAccessMessage, PublicReportView } from "./components";

export const metadata: Metadata = {
  title: "Informe de asamblea",
  robots: { index: false, follow: false },
};

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function PublicAssemblyReportPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const report = getAssemblyReportByCode(decodeURIComponent(code));
  const state = getPublicAccessState(report);

  if (state === "visible" && report) {
    return (
      <LocationGate>
        <PublicReportView report={report} />
      </LocationGate>
    );
  }

  return (
    <PublicAccessMessage
      accessCode={report?.accessCode}
      state={state === "visible" ? "invalid" : state}
      validity={report?.validity}
    />
  );
}
