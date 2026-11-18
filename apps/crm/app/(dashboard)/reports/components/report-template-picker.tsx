import { IconBubble } from "@/components/dashboard/board/icon-bubble";
import { cn } from "@/lib/utils";
import type { ReportKind, ReportTemplateItem } from "../types";
import { REPORT_KIND_TONE, ReportKindIcon } from "./report-kind-icon";

const reportTemplatePickerReportsPage = {
  group: cn("flex flex-col gap-3 md:flex-row"),
  option: cn(
    "flex flex-1 gap-3 rounded-3xl bg-card p-4 text-left shadow-[inset_0_0_0_1px_rgba(42,21,26,0.16)]",
  ),
  optionActive: cn("bg-(--granada-50) shadow-[inset_0_0_0_2px_var(--primary)]"),
  bubble: cn("size-10"),
  icon: cn("size-5"),
  text: cn("flex flex-col gap-[3px]"),
  name: cn("text-sm font-bold"),
  hint: cn("text-[12.5px] leading-snug text-[var(--tinta-suave)]"),
};

interface ReportTemplatePickerProps {
  templates: ReportTemplateItem[];
  value: ReportKind;
  onValueChange: (value: ReportKind) => void;
}

export function ReportTemplatePicker({
  templates,
  value,
  onValueChange,
}: ReportTemplatePickerProps) {
  return (
    <div aria-label="Plantilla" className={reportTemplatePickerReportsPage.group} role="radiogroup">
      {templates.map((template) => {
        const active = template.kind === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: styled card acting as a radio option.
          <button
            aria-checked={active}
            className={cn(
              reportTemplatePickerReportsPage.option,
              active && reportTemplatePickerReportsPage.optionActive,
            )}
            key={template.kind}
            onClick={() => onValueChange(template.kind)}
            role="radio"
            type="button"
          >
            <IconBubble
              className={reportTemplatePickerReportsPage.bubble}
              tone={active ? REPORT_KIND_TONE[template.kind] : "ink"}
            >
              <ReportKindIcon
                className={reportTemplatePickerReportsPage.icon}
                kind={template.kind}
              />
            </IconBubble>
            <span className={reportTemplatePickerReportsPage.text}>
              <b className={reportTemplatePickerReportsPage.name}>{template.name}</b>
              <span className={reportTemplatePickerReportsPage.hint}>{template.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
