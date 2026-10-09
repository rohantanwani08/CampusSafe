import StatusChip from './StatusChip';

export default function Counters({ counters }) {
  const safe = counters?.SAFE || 0;
  const help = counters?.NEED_ASSISTANCE || 0;
  const unreachable = counters?.UNREACHABLE || 0;
  const pending = (counters?.PENDING || 0) + (counters?.CONTACTED || 0);
  const total = safe + help + unreachable + pending;
  const accounted = total === 0 ? 0 : Math.round(((safe + help + unreachable) / total) * 100);

  return (
    <div className="flex flex-col mb-8">
      <div className="grid grid-cols-4 gap-6 mb-4">
        <div className="bg-surface border border-line p-6 rounded-lg flex flex-col justify-between">
          <StatusChip status="SAFE" />
          <span className="text-6xl text-safe mt-4 font-condensed transition-all duration-300 tabular-nums">{safe}</span>
        </div>
        
        <div className="bg-surface border border-line p-6 rounded-lg flex flex-col justify-between">
          <StatusChip status="NEED_ASSISTANCE" />
          <span className="text-6xl text-help mt-4 font-condensed transition-all duration-300 tabular-nums">{help}</span>
        </div>
        
        <div className="bg-surface border border-line p-6 rounded-lg flex flex-col justify-between">
          <StatusChip status="PENDING" />
          <span className="text-6xl text-waiting mt-4 font-condensed transition-all duration-300 tabular-nums">{pending}</span>
        </div>
        
        <div className="bg-surface border border-line p-6 rounded-lg flex flex-col justify-between">
          <StatusChip status="UNREACHABLE" />
          <span className="text-6xl text-unreachable mt-4 font-condensed transition-all duration-300 tabular-nums">{unreachable}</span>
        </div>
      </div>
      
      {/* Stacked bar and accounted text */}
      <div className="bg-surface border border-line p-4 rounded-lg flex items-center justify-between">
        <div className="flex-1 flex h-4 rounded-full overflow-hidden bg-surface-2 border border-line/50">
          <div className="bg-safe transition-all duration-300" style={{ width: `${total === 0 ? 0 : (safe/total)*100}%` }}></div>
          <div className="bg-help transition-all duration-300" style={{ width: `${total === 0 ? 0 : (help/total)*100}%` }}></div>
          <div className="bg-waiting transition-all duration-300" style={{ width: `${total === 0 ? 0 : (pending/total)*100}%` }}></div>
          {/* Unreachable hatch styling in CSS or inline */}
          <div className="transition-all duration-300" style={{ 
            width: `${total === 0 ? 0 : (unreachable/total)*100}%`,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(127, 144, 163, 0.4) 4px, rgba(127, 144, 163, 0.4) 8px)`,
            backgroundColor: 'transparent'
          }}></div>
        </div>
        <div className="ml-6 flex items-center space-x-2">
          <span className="text-2xl font-condensed tabular-nums">{accounted}%</span>
          <span className="text-sm text-muted">accounted for</span>
        </div>
      </div>
    </div>
  );
}
