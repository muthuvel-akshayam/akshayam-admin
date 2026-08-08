import React from 'react';

export interface PlanetPlacement {
  houseIndex: number; // 0 to 11 corresponding to traditional South Indian chart layout
  planets: string[]; // e.g. ["சனி", "கேது", "லக்"]
}

export interface JathagamProps {
  rasiData: PlanetPlacement[];
  navamsamData: PlanetPlacement[];
}

const getPlanetsForHouse = (data: PlanetPlacement[], houseIndex: number) => {
  const house = data.find((d) => d.houseIndex === houseIndex);
  return house ? house.planets : [];
};

const ChartGrid = ({ data, title }: { data: PlanetPlacement[], title: string }) => {
  // Mapping the sequence to house indices for a 4x4 grid.
  // 11 = Pisces (Top-Left)
  // 0  = Aries
  // ...
  // Center is a 2x2 merged box.
  const sequence = [11, 0, 1, 2, 10, 'CENTER', 3, 9, 4, 8, 7, 6, 5];

  // Detect Lagna (Ascendant) by checking if any planet abbreviation matches "லக்"
  const hasLagna = (planets: string[]) => 
    planets.some(p => p.includes('லக்') || p.includes('Lagnam') || p.includes('Asc'));

  return (
    <div className="w-full max-w-xs sm:max-w-[320px] grid grid-cols-4 gap-[1px] bg-gray-400 border border-gray-400 rounded-sm overflow-hidden shadow-sm mx-auto">
      {sequence.map((item) => {
        if (item === 'CENTER') {
          return (
            <div key="center" className="col-span-2 row-span-2 bg-white flex items-center justify-center font-bold text-gray-700 text-sm md:text-base">
              {title}
            </div>
          );
        } else {
          const houseIndex = item as number;
          const planets = getPlanetsForHouse(data, houseIndex);
          const isLagna = hasLagna(planets);
          
          return (
            <div key={houseIndex} className="relative bg-white aspect-square p-1 flex flex-wrap content-start gap-1 text-[10px] sm:text-xs text-gray-800 leading-none">
              {/* Lagna indicator slash in the top-left corner */}
              {isLagna && (
                <svg className="absolute top-0 left-0 w-3.5 h-3.5 text-gray-500" viewBox="0 0 10 10">
                  <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
              {planets.map((planet, idx) => (
                <span 
                  key={idx} 
                  className={`inline-block ${isLagna && idx === 0 ? 'ml-3' : ''}`}
                >
                  {planet}
                </span>
              ))}
            </div>
          );
        }
      })}
    </div>
  );
};

export const JathagamGridView: React.FC<JathagamProps> = ({ rasiData, navamsamData }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-start p-4">
      <div className="w-full flex-1 flex justify-center">
        <ChartGrid data={rasiData} title="ராசி" />
      </div>
      <div className="w-full flex-1 flex justify-center">
        <ChartGrid data={navamsamData} title="நவாம்சம்" />
      </div>
    </div>
  );
};

export default JathagamGridView;
