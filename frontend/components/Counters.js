import { useEffect, useState } from 'react';
import StatusChip from './StatusChip';

function TweenNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === displayValue) return;
    
    const start = displayValue;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, displayValue]);

  return <span>{displayValue}</span>;
}

export default function Counters({ counters }) {
  const safe = counters?.SAFE || 0;
  const help = counters?.NEED_ASSISTANCE || 0;
  const unreachable = counters?.UNREACHABLE || 0;
  const pending = (counters?.PENDING || 0) + (counters?.CONTACTED || 0) + (counters?.UNCLEAR || 0);
  const total = safe + help + unreachable + pending;
  const accounted = total === 0 ? 0 : Math.round(((safe + help + unreachable) / total) * 100);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex-1 flex flex-col justify-around mb-4 space-y-2">
        <div className="flex flex-col">
          <div className="mb-2"><StatusChip status="SAFE" /></div>
          <div className="text-[72px] leading-none text-safe font-condensed tabular-nums">
            <TweenNumber value={safe} />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="mb-2"><StatusChip status="NEED_ASSISTANCE" /></div>
          <div className="text-[72px] leading-none text-help font-condensed tabular-nums">
            <TweenNumber value={help} />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="mb-2"><StatusChip status="UNREACHABLE" /></div>
          <div className="text-[72px] leading-none text-unreachable font-condensed tabular-nums">
            <TweenNumber value={unreachable} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2"><StatusChip status="PENDING" /></div>
          <div className="text-[72px] leading-none text-waiting font-condensed tabular-nums">
            <TweenNumber value={pending} />
          </div>
        </div>
      </div>
      
      {/* Stacked bar and accounted text */}
      <div className="flex flex-col space-y-2 mt-auto">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-condensed tabular-nums text-text">{accounted}%</span>
          <span className="text-sm text-muted">accounted for</span>
        </div>
        <div className="flex w-full h-3 rounded-full overflow-hidden bg-surface-2 border border-line/50">
          <div className="bg-safe transition-all duration-300" style={{ width: `${total === 0 ? 0 : (safe/total)*100}%` }}></div>
          <div className="bg-help transition-all duration-300" style={{ width: `${total === 0 ? 0 : (help/total)*100}%` }}></div>
          <div className="transition-all duration-300" style={{ 
            width: `${total === 0 ? 0 : (unreachable/total)*100}%`,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(127, 144, 163, 0.4) 4px, rgba(127, 144, 163, 0.4) 8px)`,
            backgroundColor: 'transparent'
          }}></div>
          <div className="bg-waiting transition-all duration-300" style={{ width: `${total === 0 ? 0 : (pending/total)*100}%` }}></div>
        </div>
      </div>
    </div>
  );
}
