/** Dark fill that rises from the bottom of a CTA on hover; its `CTA_ARROW` icon nudges up-right. */
export const CTA_FILL =
  'group/cta relative isolate overflow-hidden before:absolute before:inset-0 before:-z-1 before:bg-coal before:[transform:translateY(101%)] before:[transition:transform_0.5s_var(--ease-obra)] hover:before:[transform:translateY(0)]';

export const CTA_ARROW =
  '[transition:transform_0.5s_var(--ease-obra)] group-hover/cta:[transform:translate(4px,-4px)]';
