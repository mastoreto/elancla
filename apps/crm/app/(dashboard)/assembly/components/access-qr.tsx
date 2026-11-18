import { cn } from "@/lib/utils";

const QR_SIZE = 21;
const QR_FINDER = 7;

// Deterministic placeholder pattern derived from the code; the real QR is generated with the API.
function hashCell(code: string, row: number, column: number): boolean {
  let hash = 17;
  for (const char of `${code}:${row}:${column}`) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return hash % 2 === 0;
}

function isFinder(row: number, column: number): boolean {
  const near = (value: number) => value < QR_FINDER;
  const far = (value: number) => value >= QR_SIZE - QR_FINDER;
  return (near(row) && near(column)) || (near(row) && far(column)) || (far(row) && near(column));
}

const accessQrAssemblyPage = {
  grid: cn("grid aspect-square w-full gap-px rounded-lg bg-white p-3"),
  filled: cn("bg-tinta"),
  empty: cn("bg-white"),
};

interface AccessQrProps {
  code: string;
  className?: string;
}

export function AccessQr({ code, className }: AccessQrProps) {
  const cells = Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const row = Math.floor(index / QR_SIZE);
    const column = index % QR_SIZE;
    return { index, filled: isFinder(row, column) || hashCell(code, row, column) };
  });

  return (
    <div
      aria-label={`Código QR de acceso ${code}`}
      className={cn(accessQrAssemblyPage.grid, className)}
      role="img"
      style={{ gridTemplateColumns: `repeat(${QR_SIZE}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => (
        <span
          className={cell.filled ? accessQrAssemblyPage.filled : accessQrAssemblyPage.empty}
          key={cell.index}
        />
      ))}
    </div>
  );
}
