import { cn } from "@/lib/utils";
import { LIVE_ACCESS_BARS, LIVE_BARS_HISTORIC_COUNT } from "../data/assembly-panel-samples";

const assemblyLiveBarsAssemblyPage = {
  row: cn("mb-3.5 flex h-[72px] items-end gap-[5px]"),
  bar: cn("w-full rounded-t-md rounded-b-[2px]"),
  past: cn("bg-[#9fd0b6]"),
  recent: cn("bg-[var(--vida)]"),
};

/** Accesses per minute; `height` is the only inline value because it comes from data. */
export function AssemblyLiveBars() {
  return (
    <div aria-hidden="true" className={assemblyLiveBarsAssemblyPage.row}>
      {LIVE_ACCESS_BARS.map((value, index) => (
        <span
          className={cn(
            assemblyLiveBarsAssemblyPage.bar,
            index < LIVE_BARS_HISTORIC_COUNT
              ? assemblyLiveBarsAssemblyPage.past
              : assemblyLiveBarsAssemblyPage.recent,
          )}
          // biome-ignore lint/suspicious/noArrayIndexKey: static series, position is its identity.
          key={index}
          style={{ height: value }}
        />
      ))}
    </div>
  );
}
