import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="hidden sm:flex items-center rounded-full bg-white dark:bg-surface-dark shadow-sm border border-neutral-200 dark:border-neutral-700 hover:border-primary/30 px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-primary/20 w-64">
      <span className="material-symbols-outlined text-primary text-[20px]">
        search
      </span>
      <input
        className="bg-transparent border-none text-sm w-full focus:ring-0 focus:outline-none placeholder-neutral-400 dark:text-white font-sans ml-2"
        placeholder="Buscar..."
        type="text"
      />
    </div>
  );
};

export default SearchBar;
