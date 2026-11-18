import { Settings, Video } from "lucide-react";
import { BoardButton } from "@/components/dashboard/board/board-button";
import { getChurchRoutePath } from "@/lib/church";
import { cn } from "@/lib/utils";

const sermonsLiveBannerSermonsPage = {
  container: cn(
    "flex flex-wrap items-center gap-3.5 rounded-[26px] px-4 py-3",
    "bg-[linear-gradient(90deg,#25141a,#3a1a22_60%,#4a2a26)] text-white",
  ),
  bubble: cn(
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-(image:--grad-avatar) text-[var(--oro-texto)]",
    "shadow-[0_0_0_4px_rgba(255,255,255,0.18)]",
  ),
  icon: cn("size-5"),
  text: cn("flex min-w-60 flex-1 flex-col"),
  title: cn("text-[15px] font-bold"),
  detail: cn("text-[13px] text-white/75"),
  action: cn("bg-white text-primary shadow-none hover:bg-white/90"),
  actionIcon: cn("size-4"),
};

export function SermonsLiveBanner() {
  return (
    <section aria-label="Directo de YouTube" className={sermonsLiveBannerSermonsPage.container}>
      <span className={sermonsLiveBannerSermonsPage.bubble}>
        <Video aria-hidden="true" className={sermonsLiveBannerSermonsPage.icon} />
      </span>
      <div className={sermonsLiveBannerSermonsPage.text}>
        <b className={sermonsLiveBannerSermonsPage.title}>Directo de YouTube conectado</b>
        <span className={sermonsLiveBannerSermonsPage.detail}>
          Cuando empieza la transmisión, aparece sola en el sitio y se guarda aquí al terminar.
        </span>
      </div>
      <BoardButton
        className={sermonsLiveBannerSermonsPage.action}
        href={getChurchRoutePath("settings")}
        size="sm"
      >
        <Settings aria-hidden="true" className={sermonsLiveBannerSermonsPage.actionIcon} />
        Configurar
      </BoardButton>
    </section>
  );
}
