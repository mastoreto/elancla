import React from 'react';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-base font-bold text-gray-800 dark:text-gray-100 mt-6 mb-2">
    {children}
  </h4>
);
