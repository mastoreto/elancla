import { motion } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import type { Doctrine } from './types';

interface DoctrineCardProps {
  doctrine: Doctrine;
  onClick: (doctrine: Doctrine) => void;
}

export const DoctrineCard = ({ doctrine, onClick }: DoctrineCardProps) => {
  const isHighlight = doctrine.id === 'jesucristo';

  if (isHighlight) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group bg-primary text-white p-8 rounded-2xl shadow-lg hover:shadow-red-500/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
        onClick={() => onClick(doctrine)}
      >
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="flex justify-between items-start mb-6 relative z-10">
          <span className="text-white font-display text-4xl font-bold opacity-30">
            {doctrine.number}
          </span>
          <div className="bg-white/20 p-3 rounded-full text-white backdrop-blur-sm">
            <doctrine.icon className="text-2xl" />
          </div>
        </div>
        <h3 className="font-display font-bold text-2xl mb-3 relative z-10">
          {doctrine.title}
        </h3>
        <p className="text-white/90 text-sm leading-relaxed mb-4 relative z-10">
          {doctrine.description}
        </p>
        <div className="flex items-center text-white font-bold text-xs uppercase tracking-wider mt-auto relative z-10">
          Leer más{' '}
          <MdArrowForward className="text-sm ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-surface p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border cursor-pointer"
      onClick={() => onClick(doctrine)}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-ink/20 font-display text-4xl font-bold">
          {doctrine.number}
        </span>
        <div className="bg-primary-50 p-3 rounded-full text-primary">
          <doctrine.icon className="text-2xl" />
        </div>
      </div>
      <h3 className="font-display font-bold text-2xl mb-3 text-ink group-hover:text-primary transition-colors">
        {doctrine.title}
      </h3>
      <p className="text-ink/65 text-sm leading-relaxed mb-4">
        {doctrine.description}
      </p>
      <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider mt-auto">
        Leer más{' '}
        <MdArrowForward className="text-sm ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};
