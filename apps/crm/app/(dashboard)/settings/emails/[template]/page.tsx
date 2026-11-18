import { notFound } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { EMAIL_TEMPLATES, isEmailTemplateKey } from "../emails-registry";

const emailPreviewSettingsPage = {
  frame: cn("h-[720px] w-full rounded-xl border bg-white"),
};

/** biome-ignore lint/style/noDefaultExport: Next.js App Router page files require default exports. */
export default async function EmailPreviewPage({
  params,
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;

  if (!isEmailTemplateKey(template)) {
    notFound();
  }

  const html = await EMAIL_TEMPLATES[template].render();

  return (
    <>
      <DashboardPageHeader
        description="Vista previa con datos de ejemplo."
        emphasis="de correo"
        kicker="Sistema · Configuración"
        title={EMAIL_TEMPLATES[template].label}
      />
      <iframe
        className={emailPreviewSettingsPage.frame}
        sandbox=""
        srcDoc={html}
        title={`Vista previa: ${EMAIL_TEMPLATES[template].label}`}
      />
    </>
  );
}
