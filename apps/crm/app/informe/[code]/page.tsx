import type { Metadata } from "next";
import {
  getAssemblyReportByCode,
  getPublicAccessState,
} from "@/app/(dashboard)/assembly/utils/assembly-access";
import { cn } from "@/lib/utils";
import { PublicAccessMessage } from "./components/public-access-message";
import { PublicReportView } from "./components/public-report-view";

const informePage = {
  main: cn("mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-4 py-10"),
};

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

  return (
    <main className={informePage.main}>
      {state === "visible" && report ? (
        <PublicReportView report={report} />
      ) : (
        <PublicAccessMessage state={state === "visible" ? "invalid" : state} />
      )}
    </main>
  );
}
