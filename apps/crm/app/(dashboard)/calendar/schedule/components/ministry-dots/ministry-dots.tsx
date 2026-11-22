import { ministryColorValue } from "@/app/(dashboard)/calendar/utils/ministryColorValue";
import { cn } from "@/lib/utils";
import type { MinistryOption } from "../../types";

const ministryDotsSchedulePage = {
  container: cn("flex flex-wrap items-center gap-x-2.5 gap-y-1"),
  item: cn("inline-flex items-center gap-1.5 text-[12.5px] text-[var(--tinta-suave)]"),
  dot: cn("size-2.5 shrink-0 rounded-full bg-[var(--tinta-apagada)]"),
};

interface MinistryDotsProps {
  ministries: readonly MinistryOption[];
}

/** The ministries of an activity, each with a dot in the color of its `Ministry.color` token. */
export function MinistryDots({ ministries }: MinistryDotsProps) {
  if (ministries.length === 0) return null;
  return (
    <span className={ministryDotsSchedulePage.container}>
      {ministries.map((ministry) => (
        <span className={ministryDotsSchedulePage.item} key={ministry.id}>
          <span
            aria-hidden="true"
            className={ministryDotsSchedulePage.dot}
            style={{ backgroundColor: ministryColorValue(ministry.color) }}
          />
          {ministry.name}
        </span>
      ))}
    </span>
  );
}
