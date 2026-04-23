import type { ReactNode } from 'react';

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h4 className="text-base font-bold text-ink mt-6 mb-2">
    {children}
  </h4>
);
