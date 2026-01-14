import React from 'react';

export const RefList = ({ refs }: { refs: string[] }) => (
  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
      Referencias Bíblicas
    </h4>
    <div className="flex flex-wrap gap-2">
      {refs.map((ref, idx) => (
        <span
          key={idx}
          className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400"
        >
          {ref}
        </span>
      ))}
    </div>
  </div>
);
