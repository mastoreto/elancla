import { cn } from "@/lib/utils";

const publicMapInformePage = {
  container: cn("w-full overflow-hidden rounded-[22px] shadow-(--sombra)"),
  svg: cn("block h-[170px] w-full bg-[#f3ede6] shadow-[inset_0_0_0_1px_rgba(42,21,26,0.08)]"),
};

const ROADS = [
  { id: "r1", d: "M0 59.5 L340 85", width: 14 },
  { id: "r2", d: "M102 0 L142.8 170", width: 12 },
  { id: "r3", d: "M251.6 0 L224.4 170", width: 9 },
  { id: "r4", d: "M0 139.4 L340 132.6", width: 8 },
  { id: "r5", d: "M34 0 L40.8 170", width: 6 },
] as const;

const BLOCKS = [
  { id: "b1", x: 153, y: 14, width: 61, height: 34, fill: "#e7efe0" },
  { id: "b2", x: 14, y: 94, width: 68, height: 31, fill: "#ece3d8" },
  { id: "b3", x: 265, y: 99, width: 54, height: 34, fill: "#ece3d8" },
  { id: "b4", x: 48, y: 10, width: 41, height: 37, fill: "#ece3d8" },
  { id: "b5", x: 170, y: 105, width: 41, height: 24, fill: "#e7efe0" },
] as const;

/** Decorative map: the church pin with its allowed radius and the visitor's position. */
export function PublicMap() {
  return (
    <div className={publicMapInformePage.container}>
      <svg
        aria-hidden="true"
        className={publicMapInformePage.svg}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 340 170"
      >
        {BLOCKS.map((block) => (
          <rect key={block.id} rx="10" {...block} />
        ))}
        {ROADS.map((road) => (
          <path
            d={road.d}
            fill="none"
            key={road.id}
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth={road.width}
          />
        ))}
        <circle
          cx="170"
          cy="85"
          fill="#c23a4e"
          fillOpacity=".12"
          r="62"
          stroke="#c23a4e"
          strokeDasharray="7 6"
          strokeWidth="2"
        />
        <g transform="translate(154,45)">
          <path d="M16 40C16 40 30 26 30 15a14 14 0 0 0-28 0C2 26 16 40 16 40z" fill="#c23a4e" />
          <circle cx="16" cy="15" fill="#fff" r="5.5" />
        </g>
        <circle cx="300" cy="128" fill="#23171a" r="9" stroke="#fff" strokeWidth="3" />
      </svg>
    </div>
  );
}
