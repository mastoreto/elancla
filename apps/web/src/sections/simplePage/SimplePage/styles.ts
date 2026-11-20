import { cn } from '@ancla/utils';

const WRAP = 'mx-auto max-w-275 px-gutter';

// The body is HTML produced by renderRichText, so its elements are styled from the container.
const body = {
  root: cn(
    'max-w-[68ch] font-obra-sans text-[1.0625rem] leading-[1.7] text-obra-ink-soft',
    '[&>:first-child]:mt-0'
  ),
  paragraphs: cn('[&_p]:my-4'),
  headings: cn(
    '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-obra-serif [&_h2]:text-[clamp(1.5rem,3vw,2.1rem)] [&_h2]:leading-[1.1] [&_h2]:font-bold [&_h2]:text-obra-ink [&_h2]:text-balance',
    '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-obra-sans-bold [&_h3]:text-[1.25rem] [&_h3]:leading-[1.25] [&_h3]:text-obra-ink'
  ),
  lists: cn(
    '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6',
    '[&_li]:my-1.5 [&_li>p]:my-1.5'
  ),
  quote: cn(
    '[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-obra-red [&_blockquote]:pl-5 [&_blockquote]:font-obra-serif-regular [&_blockquote]:text-[1.125rem] [&_blockquote]:italic'
  ),
  inline: cn(
    '[&_strong]:font-obra-sans-bold [&_strong]:text-obra-ink',
    '[&_a]:text-obra-red [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-1 hover:[&_a]:decoration-2'
  ),
  rule: cn(
    '[&_hr]:my-10 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-obra-mist'
  ),
};

export const simplePageStyles = {
  container: cn(
    'ln bg-obra-paper pt-[clamp(6rem,12vw,9rem)] pb-[clamp(3rem,8vw,6rem)]'
  ),
  header: cn(WRAP, 'flex flex-col items-start gap-5'),
  nav: cn('flex gap-2 text-[0.875rem] text-obra-ink-soft'),
  home: cn('text-inherit'),
  title: cn('ln-h max-w-[20ch] text-[clamp(2.4rem,6vw,4.5rem)] text-balance'),
  article: cn(WRAP, 'pt-[clamp(2rem,5vw,3.5rem)]'),
  body: cn(
    body.root,
    body.paragraphs,
    body.headings,
    body.lists,
    body.quote,
    body.inline,
    body.rule
  ),
};
