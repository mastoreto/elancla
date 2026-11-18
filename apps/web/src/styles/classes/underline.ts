/**
 * Hover underline that draws in from the right (nav, footer and breadcrumb links). This part only
 * positions the line; pair it with a display utility, or use `ULINK` for the usual inline-block.
 */
export const ULINK_LINE =
  'relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:bg-current after:[transform:scaleX(0)] after:[transition:transform_0.5s_var(--ease-obra)] hover:after:origin-left hover:after:[transform:scaleX(1)]';

export const ULINK = [ULINK_LINE, 'inline-block'];
