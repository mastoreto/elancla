import React, { useState, useEffect } from 'react';
import type { Doctrine } from './types';
import { doctrines } from './doctrinesData';
import { DoctrineCard } from './DoctrineCard';
import { DoctrineModal } from './DoctrineModal';

const Timeline = () => {
  useEffect(() => {
    console.log('Timeline mounted - hydration check');
  }, []);

  const [selectedDoctrine, setSelectedDoctrine] = useState<Doctrine | null>(
    null
  );

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedDoctrine) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedDoctrine]);

  return (
    <div className="bg-background-light pt-20 dark:bg-background-dark min-h-screen text-gray-800 dark:text-gray-200 font-body transition-colors duration-300">
      <div className="relative px-6 md:px-12 lg:px-24 py-16 max-w-7xl mx-auto">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/4 -translate-y-1/4 pointer-events-none opacity-50">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,50 C50,40 50,70 100,60 C150,50 150,80 200,70"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
            ></path>
            <path
              d="M0,70 C50,60 50,90 100,80 C150,70 150,100 200,90"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
            ></path>
            <path
              d="M0,90 C50,80 50,110 100,100 C150,90 150,120 200,110"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
            ></path>
          </svg>
        </div>

        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 block">
            Fundamentos Doctrinales
          </span>
          <h1 className="font-barastika  font-black text-5xl md:text-8xl text-gray-900 dark:text-white mb-6">
            Nuestra Fe
          </h1>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Creemos que la doctrina importa. Aquí presentamos los pilares
            esenciales de lo que creemos, enseñamos y vivimos como comunidad de
            fe.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {doctrines.map((doctrine) => (
            <DoctrineCard
              key={doctrine.id}
              doctrine={doctrine}
              onClick={setSelectedDoctrine}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <DoctrineModal
        selectedDoctrine={selectedDoctrine}
        onClose={() => setSelectedDoctrine(null)}
      />
    </div>
  );
};

export default Timeline;
