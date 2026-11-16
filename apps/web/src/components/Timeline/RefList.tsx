export const RefList = ({ refs }: { refs: string[] }) => (
  <div className="mt-8 pt-8 border-t border-border">
    <h4 className="text-sm font-bold text-ink uppercase tracking-wider mb-4">
      Referencias Bíblicas
    </h4>
    <div className="flex flex-wrap gap-2">
      {refs.map((ref) => (
        <span
          key={ref}
          className="px-3 py-1 rounded-full bg-canvas-muted text-xs font-medium text-ink/65"
        >
          {ref}
        </span>
      ))}
    </div>
  </div>
);
