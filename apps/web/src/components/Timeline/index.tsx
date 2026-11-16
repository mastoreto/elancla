import { useEffect, useState } from 'react';
import { DoctrineCard } from './DoctrineCard';
import { DoctrineModal } from './DoctrineModal';
import { doctrines } from './doctrinesData';
import type { Doctrine } from './types';

const Timeline = () => {
  const [selectedDoctrine, setSelectedDoctrine] = useState<Doctrine | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedDoctrine ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedDoctrine]);

  return (
    <div className="relative mx-auto max-w-[1600px] px-6 md:px-10">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/4 -translate-y-1/4 pointer-events-none opacity-40">
        <svg aria-hidden="true" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 C50,40 50,70 100,60 C150,50 150,80 200,70" fill="none" stroke="#D5CFC7" strokeWidth="1.5" />
          <path d="M0,70 C50,60 50,90 100,80 C150,70 150,100 200,90" fill="none" stroke="#D5CFC7" strokeWidth="1.5" />
          <path d="M0,90 C50,80 50,110 100,100 C150,90 150,120 200,110" fill="none" stroke="#D5CFC7" strokeWidth="1.5" />
        </svg>
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

      {/* Modal */}
      <DoctrineModal
        selectedDoctrine={selectedDoctrine}
        onClose={() => setSelectedDoctrine(null)}
      />
    </div>
  );
};

export default Timeline;
