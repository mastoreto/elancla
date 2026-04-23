import type { ElementType, ReactNode } from 'react';

export const DoctrineModalContent = ({
  number,
  title,
  subtitle,
  icon: Icon,
  quote,
  quoteRef,
  children,
}: {
  number: string;
  title: string;
  subtitle?: ReactNode;
  icon: ElementType;
  quote?: string;
  quoteRef?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col md:flex-row h-full">
    <div className="w-full md:w-1/3 bg-primary text-white p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden shrink-0">
      <Icon className="text-9xl opacity-20 absolute -top-10 -left-10 transform rotate-12" />
      <span className="text-white/60 font-bold tracking-[0.3em] text-xs mb-4">
        DOCTRINA {number}
      </span>
      <h2 className="font-display font-black text-4xl mb-4 max-w-full">
        {subtitle || title}
      </h2>
      <div className="w-12 h-1 bg-white mb-6" />
      {quote && (
        <>
          <p className="text-white/90 text-sm italic font-serif">"{quote}"</p>
          <p className="text-white/70 text-xs mt-2 font-bold">— {quoteRef}</p>
        </>
      )}
    </div>
    <div className="w-full md:w-2/3 p-8 md:p-12 bg-surface">
      <h3 className="text-2xl font-bold text-ink mb-6 font-display">
        {title}
      </h3>
      <div className="space-y-4 text-ink/70 leading-relaxed text-sm overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);
