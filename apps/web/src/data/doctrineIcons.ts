// Pictograms for the nine doctrines (viewBox 0 0 120 120), same order as confession.doctrines.
export interface IconShape {
  d?: string;
  circle?: [number, number, number];
  /** Cut-out detail painted in the section background colour (church door). */
  cut?: boolean;
}

export const doctrineIcons: IconShape[][] = [
  // Dios: crown
  [
    { d: 'M20 90 L14 38 L40 60 L60 24 L80 60 L106 38 L100 90 Z' },
    { d: 'M22 98 H98 V106 H22 Z' },
  ],
  // Jesucristo: cross
  [{ d: 'M52 10 H68 V36 H94 V52 H68 V110 H52 V52 H26 V36 H52 Z' }],
  // Espíritu Santo: flame
  [
    {
      d: 'M60 10 C76 34 92 52 88 78 C85 98 72 108 60 108 C46 108 32 98 31 80 C30 64 40 54 46 44 C48 56 52 62 58 64 C56 46 54 30 60 10 Z',
    },
  ],
  // La Biblia: open book
  [
    { d: 'M60 34 C46 24 28 22 12 26 V94 C28 90 46 92 60 102 Z' },
    { d: 'M60 34 C74 24 92 22 108 26 V94 C92 90 74 92 60 102 Z' },
  ],
  // La Iglesia: temple with cross
  [
    { d: 'M20 108 V60 L60 32 L100 60 V108 Z' },
    { d: 'M57 6 H63 V13 H70 V19 H63 V26 H57 V19 H50 V13 H57 Z' },
    { d: 'M51 108 V88 C51 78 69 78 69 88 V108 Z', cut: true },
  ],
  // El Hombre: figure
  [
    { circle: [60, 30, 15] },
    { d: 'M30 108 C30 74 42 56 60 56 C78 56 90 74 90 108 Z' },
  ],
  // La Salvación: heart
  [
    {
      d: 'M60 104 C20 76 10 54 14 38 C18 22 34 14 48 18 C54 20 58 24 60 30 C62 24 66 20 72 18 C86 14 102 22 106 38 C110 54 100 76 60 104 Z',
    },
  ],
  // Ordenanzas: chalice
  [
    { d: 'M30 16 H90 C90 50 78 64 60 66 C42 64 30 50 30 16 Z' },
    { d: 'M56 66 H64 V92 H56 Z' },
    { d: 'M36 92 H84 V104 H36 Z' },
  ],
  // Escatología: sunrise
  [
    { d: 'M26 84 A34 34 0 0 1 94 84 Z' },
    { d: 'M60 16 V30 M26 34 L35 43 M94 34 L85 43 M8 64 H20 M100 64 H112' },
    { d: 'M10 96 H110' },
  ],
];
