import { useState } from 'react';

export default function RecipientTable({ recipients }) {
  const [search, setSearch] = useState('');

  if (!recipients || recipients.length === 0) return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full flex items-center justify-center text-gray-500">
      No recipients to display.
    </div>
  );

  const getStatusStyle = (status) => {
    switch(status) {
      case 'SAFE': return 'text-green-400 bg-green-400/10 border border-green-500/30';
      case 'NEED_ASSISTANCE': return 'text-red-400 bg-red-400/10 font-bold border border-red-500/50 animate-pulse';
      case 'UNREACHABLE': return 'text-orange-400 bg-orange-400/10 border border-orange-500/30';
      case 'UNCLEAR': return 'text-yellow-400 bg-yellow-400/10 border border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-800 border border-gray-700';
    }
  };

  const EscalationDots = ({ step, status }) => {
    const totalSteps = 5;
    // If SAFE or NEED_ASSISTANCE, they are resolved, dots should stop at current step
    return (
      <div className="flex space-x-1 mt-1">
        {[...Array(totalSteps)].map((_, i) => {
          const isActive = i < step;
          const isCurrent = i === step - 1 && status === 'PENDING';
          return (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-700'} ${isCurrent ? 'animate-ping' : ''}`}
              title={`Step ${i+1}`}
            />
          );
        })}
      </div>
    );
  };

  const filtered = recipients.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl h-full flex flex-col backdrop-blur-md">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-sm font-black text-gray-300 tracking-widest uppercase">Target Roster</h2>
        <input 
          type="text"
          placeholder="Search name or building..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-900/95 backdrop-blur z-10 shadow-sm border-b border-gray-800">
            <tr className="text-gray-500 text-xs tracking-wider uppercase">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Escalation</th>
              <th className="p-3 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-800/30 hover:bg-gray-800/50 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-white">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.building}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-0.5">
                    {r.status === 'PENDING' ? `Step ${r.step}` : 'Resolved'}
                  </span>
                  <EscalationDots step={r.step} status={r.status} />
                </td>
                <td className="p-3 text-right text-gray-500 text-xs font-mono">
                  {r.responded_at ? new Date(r.responded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : '-'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 italic">No matches found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
