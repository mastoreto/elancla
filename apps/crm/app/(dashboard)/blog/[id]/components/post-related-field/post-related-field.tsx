"use client";

import { BLOG_POST_RELATED_MAX_COUNT } from "@ancla/contracts";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const postRelatedFieldBlogPage = {
  container: cn("flex flex-col gap-2"),
  legend: cn("text-[13px] font-bold text-[var(--tinta-suave)]"),
  hint: cn("text-xs text-[var(--tinta-apagada)]"),
  error: cn("text-xs font-semibold text-primary"),
  list: cn("flex max-h-48 flex-col gap-1 overflow-y-auto rounded-2xl border border-border p-2"),
  option: cn("flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm hover:bg-secondary"),
  empty: cn("px-2 py-1.5 text-sm text-[var(--tinta-apagada)]"),
};

interface PostRelatedFieldProps {
  selectedIds: readonly string[];
  options: readonly { id: string; title: string }[];
  disabled: boolean;
  error?: string;
  onChange: (ids: string[]) => void;
}

/** Up to three posts the author wants shown as related; the API completes the rest by itself. */
export function PostRelatedField({
  selectedIds,
  options,
  disabled,
  error,
  onChange,
}: PostRelatedFieldProps) {
  const full = selectedIds.length >= BLOG_POST_RELATED_MAX_COUNT;

  function toggle(id: string, checked: boolean): void {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((selected) => selected !== id));
  }

  return (
    <fieldset className={postRelatedFieldBlogPage.container} data-testid="post-related">
      <legend className={postRelatedFieldBlogPage.legend}>Artículos relacionados</legend>
      <span className={postRelatedFieldBlogPage.hint}>
        Hasta {BLOG_POST_RELATED_MAX_COUNT}. Si eliges menos, el sitio completa con artículos
        parecidos.
      </span>
      <div className={postRelatedFieldBlogPage.list}>
        {options.length === 0 ? (
          <span className={postRelatedFieldBlogPage.empty}>Todavía no hay otros artículos.</span>
        ) : null}
        {options.map((option) => {
          const checked = selectedIds.includes(option.id);
          return (
            <label
              className={postRelatedFieldBlogPage.option}
              htmlFor={`post-related-${option.id}`}
              key={option.id}
            >
              <Checkbox
                checked={checked}
                id={`post-related-${option.id}`}
                disabled={disabled || (full && !checked)}
                onCheckedChange={(next) => toggle(option.id, next === true)}
              />
              {option.title}
            </label>
          );
        })}
      </div>
      {error ? <span className={postRelatedFieldBlogPage.error}>{error}</span> : null}
    </fieldset>
  );
}
