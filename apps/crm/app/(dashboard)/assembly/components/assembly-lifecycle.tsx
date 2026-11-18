import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LIFECYCLE_STEPS } from "../utils/assembly-view";

const assemblyLifecycleAssemblyPage = {
  row: cn("flex w-full flex-wrap items-center gap-x-2 gap-y-2.5"),
  step: cn("flex min-w-0 flex-1 items-center gap-1.5"),
  last: cn("flex-none"),
  dot: cn(
    "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
  ),
  dotDone: cn("bg-[var(--vida)] text-white"),
  dotCurrent: cn("bg-primary text-white"),
  dotPending: cn(
    "bg-card text-[var(--tinta-apagada)] shadow-[inset_0_0_0_1.5px_rgba(42,21,26,0.16)]",
  ),
  check: cn("size-3.5"),
  label: cn("text-xs whitespace-nowrap"),
  labelPending: cn("text-[var(--tinta-apagada)]"),
  line: cn("h-0.5 min-w-2 flex-1 rounded-sm"),
  lineDone: cn("bg-[var(--vida)]"),
  linePending: cn("bg-border"),
};

/** Creado → Compartido → Habilitado → Dado de baja, with the current step highlighted. */
export function AssemblyLifecycle({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className={assemblyLifecycleAssemblyPage.row}>
      {LIFECYCLE_STEPS.map((label, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const isLast = index === LIFECYCLE_STEPS.length - 1;
        return (
          <li
            className={cn(
              assemblyLifecycleAssemblyPage.step,
              isLast && assemblyLifecycleAssemblyPage.last,
            )}
            key={label}
          >
            <span
              className={cn(
                assemblyLifecycleAssemblyPage.dot,
                done && assemblyLifecycleAssemblyPage.dotDone,
                current && assemblyLifecycleAssemblyPage.dotCurrent,
                !(done || current) && assemblyLifecycleAssemblyPage.dotPending,
              )}
            >
              {done ? (
                <Check aria-hidden="true" className={assemblyLifecycleAssemblyPage.check} />
              ) : (
                index + 1
              )}
            </span>
            <b
              className={cn(
                assemblyLifecycleAssemblyPage.label,
                !(done || current) && assemblyLifecycleAssemblyPage.labelPending,
              )}
            >
              {label}
            </b>
            {isLast ? null : (
              <span
                aria-hidden="true"
                className={cn(
                  assemblyLifecycleAssemblyPage.line,
                  done
                    ? assemblyLifecycleAssemblyPage.lineDone
                    : assemblyLifecycleAssemblyPage.linePending,
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
