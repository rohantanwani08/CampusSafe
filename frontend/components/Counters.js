export default function Counters({ counters }) {
  const safe = counters?.SAFE || 0;
  const help = counters?.NEED_ASSISTANCE || 0;
  const unreachable = counters?.UNREACHABLE || 0;
  const pending = (counters?.PENDING || 0) + (counters?.CONTACTED || 0);
  const total = safe + help + unreachable + pending;
  const accounted = total === 0 ? 0 : Math.round(((safe + help + unreachable) / total) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      
      {/* Accounted For Ring */}
      <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl flex items-center justify-center shadow-lg relative col-span-2 md:col-span-1">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * accounted) / 100} className="text-blue-500 transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{accounted}%</span>
          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Accounted</span>
        </div>
      </div>

      <div className="bg-gray-900/80 border border-green-900/30 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <span className="text-xs font-bold text-green-500/80 tracking-widest mb-1 uppercase">Safe</span>
        <span className="text-6xl font-black text-green-400">{safe}</span>
      </div>
      
      <div className="bg-gray-900/80 border border-red-900/50 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
        {help > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse"></div>}
        {help > 0 && <div className="absolute inset-0 bg-red-600/5 animate-pulse-slow"></div>}
        <span className="text-xs font-bold text-red-500/80 tracking-widest mb-1 uppercase">Need Help</span>
        <span className="text-6xl font-black text-red-500">{help}</span>
      </div>
      
      <div className="bg-gray-900/80 border border-amber-900/30 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <span className="text-xs font-bold text-amber-500/80 tracking-widest mb-1 uppercase">Awaiting</span>
        <span className="text-6xl font-black text-amber-400">{pending}</span>
      </div>
      
      <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
        <span className="text-xs font-bold text-gray-500 tracking-widest mb-1 uppercase">Unreachable</span>
        <span className="text-6xl font-black text-gray-300">{unreachable}</span>
      </div>
    </div>
  );
}
