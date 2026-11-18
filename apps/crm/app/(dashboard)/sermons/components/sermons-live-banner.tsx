import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sermonsLiveBannerSermonsPage = {
  container: cn(
    "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between",
  ),
  body: cn("flex items-start gap-3"),
  icon: cn(
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-success-surface text-income",
  ),
  glyph: cn("size-5"),
  title: cn("text-sm font-semibold"),
  text: cn("text-sm text-muted-foreground"),
};

export function SermonsLiveBanner() {
  return (
    <section aria-label="Directo de YouTube" className={sermonsLiveBannerSermonsPage.container}>
      <div className={sermonsLiveBannerSermonsPage.body}>
        <span className={sermonsLiveBannerSermonsPage.icon}>
          <Radio aria-hidden="true" className={sermonsLiveBannerSermonsPage.glyph} />
        </span>
        <div>
          <h2 className={sermonsLiveBannerSermonsPage.title}>Directo de YouTube conectado</h2>
          <p className={sermonsLiveBannerSermonsPage.text}>
            Cuando empieza la transmisión, aparece sola en el sitio y se guarda aquí al terminar.
          </p>
        </div>
      </div>
      <Button type="button" variant="outline">
        Configurar
      </Button>
    </section>
  );
}
