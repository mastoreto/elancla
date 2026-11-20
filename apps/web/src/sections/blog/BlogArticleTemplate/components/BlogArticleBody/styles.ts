import { cn } from '@ancla/utils';

/*
 * The body arrives as HTML from `renderBlogBody`, so its elements are styled from the container
 * with arbitrary variants over the `blog-*` classes the renderer emits. Tailwind covers all of it;
 * no global CSS is needed.
 */

// Tailwind reads class names as literal text, so none of these strings is assembled at runtime.

const text = {
  // Running text size shared by paragraphs, list items and the text of each block.
  paragraph: cn(
    '[&_p]:m-0 [&_p]:text-[clamp(1.0625rem,1.4vw,1.25rem)] [&_p]:leading-[1.7]'
  ),
  dropCap: cn(
    '[&_.blog-dropcap]:first-letter:float-left [&_.blog-dropcap]:first-letter:pt-1.5 [&_.blog-dropcap]:first-letter:pr-3',
    '[&_.blog-dropcap]:first-letter:font-obra-serif [&_.blog-dropcap]:first-letter:text-[5.75rem]',
    '[&_.blog-dropcap]:first-letter:leading-[0.8] [&_.blog-dropcap]:first-letter:font-bold [&_.blog-dropcap]:first-letter:text-obra-red'
  ),
  h2: cn(
    '[&_h2]:mt-5 [&_h2]:m-0 [&_h2]:scroll-mt-24 [&_h2]:font-obra-serif [&_h2]:text-[clamp(1.875rem,3.2vw,2.75rem)]',
    '[&_h2]:leading-[1.02] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-obra-ink'
  ),
  h3: cn(
    '[&_h3]:mx-0 [&_h3]:mt-2 [&_h3]:mb-0 [&_h3]:font-obra-serif [&_h3]:text-[1.75rem] [&_h3]:leading-[1.1] [&_h3]:text-obra-ink'
  ),
  inline: cn(
    '[&_a]:text-obra-red [&_a]:underline [&_a]:underline-offset-3',
    '[&_strong]:font-obra-sans-bold [&_strong]:text-obra-ink'
  ),
  divider: cn(
    '[&_hr]:mx-0 [&_hr]:my-4 [&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-obra-ink/15'
  ),
};

const lists = {
  bullets: cn(
    '[&_ul]:m-0 [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-3.5 [&_ul]:p-0',
    '[&_ul>li]:flex [&_ul>li]:gap-3.5',
    "[&_ul>li]:before:mt-[0.7em] [&_ul>li]:before:size-[9px] [&_ul>li]:before:flex-none [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-obra-red [&_ul>li]:before:content-['']"
  ),
  numbered: cn(
    '[&_ol]:m-0 [&_ol]:flex [&_ol]:list-none [&_ol]:flex-col [&_ol]:gap-3 [&_ol]:p-0 [&_ol]:[counter-reset:n]',
    '[&_ol>li]:m-0 [&_ol>li]:flex [&_ol>li]:items-start [&_ol>li]:gap-4 [&_ol>li]:rounded-3xl [&_ol>li]:bg-obra-white',
    '[&_ol>li]:px-5.5 [&_ol>li]:py-5 [&_ol>li]:[counter-increment:n]',
    '[&_ol>li]:before:font-obra-serif [&_ol>li]:before:text-[2.125rem] [&_ol>li]:before:leading-none',
    '[&_ol>li]:before:font-bold [&_ol>li]:before:text-obra-red [&_ol>li]:before:content-[counter(n)]'
  ),
};

const quotes = {
  plain: cn(
    '[&_blockquote:not(.blog-verse):not(.blog-pullquote)]:m-0 [&_blockquote:not(.blog-verse):not(.blog-pullquote)]:border-l-2 [&_blockquote:not(.blog-verse):not(.blog-pullquote)]:border-obra-red',
    '[&_blockquote:not(.blog-verse):not(.blog-pullquote)]:pl-5 [&_blockquote:not(.blog-verse):not(.blog-pullquote)]:font-obra-serif-regular [&_blockquote:not(.blog-verse):not(.blog-pullquote)]:italic'
  ),
  verse: cn(
    '[&_.blog-verse]:mx-0 [&_.blog-verse]:my-2 [&_.blog-verse]:flex [&_.blog-verse]:flex-col [&_.blog-verse]:gap-3.5',
    '[&_.blog-verse]:rounded-[36px] [&_.blog-verse]:bg-obra-red [&_.blog-verse]:p-[clamp(1.5rem,3vw,2.5rem)] [&_.blog-verse]:text-white',
    '[&_.blog-verse-text]:font-obra-serif [&_.blog-verse-text]:text-[clamp(1.375rem,2.2vw,2rem)] [&_.blog-verse-text]:leading-[1.2] [&_.blog-verse-text]:font-bold',
    '[&_.blog-verse-reference]:font-obra-sans-bold [&_.blog-verse-reference]:text-[0.8125rem] [&_.blog-verse-reference]:not-italic',
    '[&_.blog-verse-reference]:tracking-[0.16em] [&_.blog-verse-reference]:text-obra-blush [&_.blog-verse-reference]:uppercase'
  ),
  pullquote: cn(
    '[&_.blog-pullquote]:mx-0 [&_.blog-pullquote]:my-3 [&_.blog-pullquote]:flex [&_.blog-pullquote]:flex-col [&_.blog-pullquote]:gap-3',
    '[&_.blog-pullquote]:border-l-4 [&_.blog-pullquote]:border-obra-red [&_.blog-pullquote]:py-1.5 [&_.blog-pullquote]:pl-6.5',
    '[&_.blog-pullquote]:font-obra-serif [&_.blog-pullquote]:text-[clamp(1.5rem,2.5vw,2.25rem)] [&_.blog-pullquote]:leading-[1.15]',
    '[&_.blog-pullquote]:font-bold [&_.blog-pullquote]:text-obra-ink',
    '[&_.blog-pullquote-cite]:font-obra-sans-bold [&_.blog-pullquote-cite]:text-[0.8125rem] [&_.blog-pullquote-cite]:not-italic',
    '[&_.blog-pullquote-cite]:tracking-[0.12em] [&_.blog-pullquote-cite]:font-normal [&_.blog-pullquote-cite]:text-obra-muted'
  ),
};

const media = {
  figure: cn(
    '[&_.blog-figure]:mx-0 [&_.blog-figure]:my-2 [&_.blog-figure]:flex [&_.blog-figure]:flex-col [&_.blog-figure]:gap-2.5',
    '[&_.blog-figure-frame]:relative [&_.blog-figure-frame]:overflow-hidden [&_.blog-figure-frame]:rounded-[28px] [&_.blog-figure-frame]:bg-cover-paper',
    '[&_.blog-figure-landscape_.blog-figure-frame]:h-85 [&_.blog-figure-wide_.blog-figure-frame]:h-70',
    '[&_.blog-figure-square_.blog-figure-frame]:aspect-square',
    'max-sm:[&_.blog-figure-landscape_.blog-figure-frame]:h-55 max-sm:[&_.blog-figure-wide_.blog-figure-frame]:h-55',
    '[&_.blog-figure-image]:size-full [&_.blog-figure-image]:object-cover',
    '[&_.blog-figure-caption]:text-[0.8125rem] [&_.blog-figure-caption]:leading-normal [&_.blog-figure-caption]:text-obra-muted'
  ),
  video: cn(
    '[&_.blog-video]:mx-0 [&_.blog-video]:my-2 [&_.blog-video]:flex [&_.blog-video]:flex-col [&_.blog-video]:gap-4',
    '[&_.blog-video]:rounded-[36px] [&_.blog-video]:bg-obra-warm [&_.blog-video]:p-5 [&_.blog-video]:text-obra-cream',
    '[&_.blog-video-frame]:overflow-hidden [&_.blog-video-frame]:rounded-3xl [&_.blog-video-frame]:bg-obra-warm-line',
    '[&_.blog-video-frame_iframe]:block [&_.blog-video-frame_iframe]:aspect-video [&_.blog-video-frame_iframe]:w-full [&_.blog-video-frame_iframe]:border-0',
    '[&_.blog-video-caption]:px-2 [&_.blog-video-caption]:pb-1.5 [&_.blog-video-caption]:text-[0.875rem] [&_.blog-video-caption]:text-obra-sand'
  ),
};

const callouts = {
  note: cn(
    '[&_.blog-note]:mx-0 [&_.blog-note]:my-2 [&_.blog-note]:flex [&_.blog-note]:flex-col [&_.blog-note]:gap-2',
    '[&_.blog-note]:rounded-3xl [&_.blog-note]:bg-obra-mist [&_.blog-note]:px-6.5 [&_.blog-note]:py-5.5',
    '[&_.blog-note-label]:font-obra-sans-bold [&_.blog-note-label]:text-[0.8125rem] [&_.blog-note-label]:tracking-[0.16em]',
    '[&_.blog-note-label]:text-obra-red [&_.blog-note-label]:uppercase',
    '[&_.blog-note_p]:text-[1.0625rem] [&_.blog-note_p]:leading-[1.55]'
  ),
  links: cn(
    '[&_.blog-links]:flex [&_.blog-links]:flex-col [&_.blog-links]:gap-3',
    '[&_.blog-link-card]:flex [&_.blog-link-card]:flex-col [&_.blog-link-card]:gap-1 [&_.blog-link-card]:rounded-3xl',
    '[&_.blog-link-card]:bg-obra-white [&_.blog-link-card]:px-5.5 [&_.blog-link-card]:py-4.5 [&_.blog-link-card]:no-underline',
    '[&_.blog-link-card]:[transition:translate_0.5s_var(--ease-obra)] [&_.blog-link-card]:hover:-translate-y-0.5',
    '[&_.blog-link-title]:font-obra-serif [&_.blog-link-title]:text-[1.25rem] [&_.blog-link-title]:text-obra-ink',
    '[&_.blog-link-description]:text-[0.9375rem] [&_.blog-link-description]:text-obra-ink-soft',
    '[&_.blog-link-source]:text-[0.875rem] [&_.blog-link-source]:text-obra-muted'
  ),
};

export const blogArticleBodyStyles = {
  container: cn(
    'flex max-w-180 min-w-0 flex-1 flex-col gap-6.5 text-obra-body',
    text.paragraph,
    text.dropCap,
    text.h2,
    text.h3,
    text.inline,
    text.divider,
    lists.bullets,
    lists.numbered,
    quotes.plain,
    quotes.verse,
    quotes.pullquote,
    media.figure,
    media.video,
    callouts.note,
    callouts.links
  ),
};
