import { AnimatePresence, motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import type { Doctrine } from './types';

interface DoctrineModalProps {
  selectedDoctrine: Doctrine | null;
  onClose: () => void;
}

export const DoctrineModal = ({ selectedDoctrine, onClose }: DoctrineModalProps) => {
  return (
    <AnimatePresence>
      {selectedDoctrine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full bg-canvas-muted hover:bg-primary-50 text-ink/50 hover:text-primary transition-colors z-20"
              onClick={onClose}
            >
              <MdClose />
            </button>

            {selectedDoctrine.fullContent ? (
              selectedDoctrine.fullContent
            ) : (
              <div className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="bg-primary-50 p-4 rounded-full text-primary mb-4">
                    <selectedDoctrine.icon className="text-4xl" />
                  </div>
                  <span className="text-primary font-bold tracking-widest text-xs mb-2">
                    DOCTRINA {selectedDoctrine.number}
                  </span>
                  <h2 className="font-display font-black text-4xl mb-4 text-ink">
                    {selectedDoctrine.title}
                  </h2>
                </div>
                <div className="text-ink/70 leading-relaxed text-center max-w-2xl mx-auto">
                  <p>{selectedDoctrine.description}</p>
                  <p className="mt-4 italic opacity-80">
                    Más detalles sobre esta doctrina próximamente.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
