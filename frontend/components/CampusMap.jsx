import { useState } from 'react';
import { BUILDINGS, PATHS, GREEN_AREAS } from '../lib/buildings';
import BuildingDrawer from './BuildingDrawer';

export default function CampusMap({ buildingsData, recipients, onPersonClick }) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleBuildingClick = (id) => {
    setSelectedBuilding(id);
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const selectedBuildingData = BUILDINGS.find(b => b.id === selectedBuilding);
  const buildingRecipients = recipients?.filter(r => r.building === selectedBuilding) || [];

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center p-4" 
      onMouseMove={handleMouseMove}
    >
      <svg 
        viewBox="0 0 1100 700" 
        className="w-full h-full max-h-[600px] object-contain"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="var(--color-surface-2)" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-unreachable)" strokeWidth="2" strokeOpacity="0.5" />
          </pattern>
        </defs>

        {GREEN_AREAS.map((g, i) => (
          <rect 
            key={`g-${i}`} 
            x={g.x} y={g.y} width={g.width} height={g.height} rx={g.rx} 
            fill="var(--color-safe)" fillOpacity="0.1" 
            stroke="var(--color-safe)" strokeOpacity="0.3" strokeWidth="1" 
          />
        ))}

        {PATHS.map((p, i) => (
          <path 
            key={`p-${i}`} 
            d={p} 
            fill="none" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="4 4" 
          />
        ))}

        {BUILDINGS.map(b => {
          const bData = buildingsData.find(x => x.id === b.id) || { total: 0, safe: 0, help: 0, unreachable: 0, waiting: 0, worst_status: 'NONE' };
          
          let fillStr = 'var(--color-surface-2)';
          let strokeStr = 'var(--color-line)';
          let fillOpacity = 1;
          let useHatch = false;

          if (bData.total > 0) {
            if (bData.worst_status === 'NEED_ASSISTANCE') {
               fillStr = 'var(--color-help)'; fillOpacity = 0.15; strokeStr = 'var(--color-help)';
            } else if (bData.worst_status === 'UNREACHABLE') {
               useHatch = true; strokeStr = 'var(--color-unreachable)';
            } else if (bData.worst_status === 'PENDING') {
               fillStr = 'var(--color-waiting)'; fillOpacity = 0.15; strokeStr = 'var(--color-waiting)';
            } else if (bData.worst_status === 'SAFE') {
               fillStr = 'var(--color-safe)'; fillOpacity = 0.15; strokeStr = 'var(--color-safe)';
            }
          }

          return (
              <g 
                key={b.id} 
                className="cursor-pointer outline-none group transition-colors"
                onClick={() => handleBuildingClick(b.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleBuildingClick(b.id); }}
                onMouseEnter={() => setHoveredBuilding(b.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onFocus={() => setHoveredBuilding(b.id)}
                onBlur={() => setHoveredBuilding(null)}
                tabIndex={0}
              >
              {bData.help > 0 && (
                <rect 
                   x={b.svg.x} y={b.svg.y} width={b.svg.width} height={b.svg.height} 
                   fill="none" stroke="var(--color-help)" strokeWidth="6" 
                   className="opacity-50"
                   style={{ animation: 'pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />
              )}
              
              <rect 
                id={`bldg-${b.id}`}
                x={b.svg.x} y={b.svg.y} width={b.svg.width} height={b.svg.height} 
                fill={useHatch ? 'url(#hatch)' : fillStr} 
                fillOpacity={useHatch ? 1 : fillOpacity}
                stroke={strokeStr} strokeWidth="2" 
                className="group-hover:stroke-[3px] group-focus:stroke-[3px] transition-all"
              />
              
              {bData.total > 0 ? (
                <>
                  <text x={b.svg.textX} y={b.svg.textY - 8} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text)" className="font-sans text-[14px] pointer-events-none">
                    {b.name}
                  </text>
                  <text x={b.svg.textX} y={b.svg.textY + 12} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text)" className="font-condensed text-[16px] pointer-events-none">
                    {bData.safe} / {bData.total}
                  </text>
                </>
              ) : (
                <text x={b.svg.textX} y={b.svg.textY} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text)" className="font-sans text-[14px] pointer-events-none">
                  {b.name}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoveredBuilding && !selectedBuilding && (
        <div 
          className="fixed z-50 pointer-events-none bg-surface border border-line p-3 rounded-lg shadow-xl"
          style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
        >
          {(() => {
            const hb = BUILDINGS.find(b => b.id === hoveredBuilding);
            const hd = buildingsData.find(x => x.id === hoveredBuilding) || { total: 0, safe: 0, help: 0, unreachable: 0, waiting: 0 };
            return (
              <>
                <div className="font-semibold text-text mb-1">{hb.name}</div>
                {hd.total > 0 ? (
                  <div className="text-sm text-muted space-y-1">
                    <div>Total: {hd.total}</div>
                    <div className="text-safe">Safe: {hd.safe}</div>
                    <div className="text-help">Needs Help: {hd.help}</div>
                    <div className="text-unreachable">Unreachable: {hd.unreachable}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted">Empty</div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-6 text-xs text-text bg-surface/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-line shadow-lg pointer-events-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-safe/15 border border-safe"></div>
          <span>Safe</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-waiting/15 border border-waiting"></div>
          <span>Waiting</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'url(#hatch) var(--color-surface-2)', border: '1px solid var(--color-unreachable)' }}></div>
          <span>Can&apos;t Reach</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm bg-help/15 border border-help"></div>
          <span>Needs Help</span>
        </div>
      </div>

      {selectedBuilding && (
        <BuildingDrawer 
          buildingId={selectedBuilding} 
          buildingName={selectedBuildingData?.name}
          recipients={buildingRecipients}
          onClose={() => setSelectedBuilding(null)}
          onPersonClick={(person) => {
            setSelectedBuilding(null);
            onPersonClick(person);
          }}
        />
      )}
    </div>
  );
}
